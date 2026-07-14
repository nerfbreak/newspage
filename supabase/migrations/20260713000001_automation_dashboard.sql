-- =============================================================
-- Supabase SQL Migration: Automation Dashboard
-- Run this in Supabase SQL Editor or via supabase db push
-- =============================================================

-- Enable required extension
create extension if not exists "pgcrypto";

-- =============================================================
-- Enums
-- =============================================================
do $$ begin
  create type public.user_role as enum ('admin', 'operator', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum ('queued', 'running', 'success', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.log_level as enum ('info', 'warning', 'error', 'success');
exception when duplicate_object then null; end $$;

-- =============================================================
-- Profiles (linked to Supabase Auth users)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Automation Jobs
-- =============================================================
create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  status public.job_status not null default 'queued',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  params jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  triggered_by uuid references public.profiles(id) on delete set null,
  locked_by text,
  cancel_requested boolean not null default false,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Automation Logs
-- =============================================================
create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.automation_jobs(id) on delete cascade,
  level public.log_level not null default 'info',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Settings (key-value store)
-- =============================================================
create table if not exists public.automation_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  is_secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Worker Heartbeats
-- =============================================================
create table if not exists public.worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  worker_id text unique not null,
  status text not null default 'online',
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- updated_at Trigger Function
-- =============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_jobs_updated_at on public.automation_jobs;
create trigger set_jobs_updated_at
  before update on public.automation_jobs
  for each row execute function public.set_updated_at();

drop trigger if exists set_settings_updated_at on public.automation_settings;
create trigger set_settings_updated_at
  before update on public.automation_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_worker_heartbeats_updated_at on public.worker_heartbeats;
create trigger set_worker_heartbeats_updated_at
  before update on public.worker_heartbeats
  for each row execute function public.set_updated_at();

-- =============================================================
-- Helper: current user's role (used in RLS policies)
-- =============================================================
create or replace function public.current_user_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- =============================================================
-- Atomic Job Claim for Worker (service role only)
-- =============================================================
create or replace function public.claim_next_queued_job(worker_id_input text)
returns public.automation_jobs as $$
declare
  claimed_job public.automation_jobs;
begin
  update public.automation_jobs
  set
    status = 'running',
    locked_by = worker_id_input,
    started_at = coalesce(started_at, now()),
    updated_at = now()
  where id = (
    select id
    from public.automation_jobs
    where status = 'queued'
    order by created_at asc
    for update skip locked
    limit 1
  )
  returning * into claimed_job;

  return claimed_job;
end;
$$ language plpgsql security definer;

-- =============================================================
-- Auto-create profile on new user signup
-- =============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'operator'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Indexes
-- =============================================================
create index if not exists idx_jobs_status_created_at
  on public.automation_jobs(status, created_at desc);

create index if not exists idx_jobs_triggered_by
  on public.automation_jobs(triggered_by);

create index if not exists idx_logs_job_id_created_at
  on public.automation_logs(job_id, created_at asc);

create index if not exists idx_worker_heartbeats_last_seen
  on public.worker_heartbeats(last_seen_at desc);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.automation_logs enable row level security;
alter table public.automation_settings enable row level security;
alter table public.worker_heartbeats enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Profiles: users can update their own basic info (not role)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Job policies
drop policy if exists "Authenticated users can read jobs" on public.automation_jobs;
create policy "Authenticated users can read jobs"
  on public.automation_jobs for select
  to authenticated
  using (true);

drop policy if exists "Operators and admins can create jobs" on public.automation_jobs;
create policy "Operators and admins can create jobs"
  on public.automation_jobs for insert
  to authenticated
  with check (public.current_user_role() in ('admin', 'operator'));

drop policy if exists "Operators and admins can update jobs" on public.automation_jobs;
create policy "Operators and admins can update jobs"
  on public.automation_jobs for update
  to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

-- Logs policies
drop policy if exists "Authenticated users can read logs" on public.automation_logs;
create policy "Authenticated users can read logs"
  on public.automation_logs for select
  to authenticated
  using (true);

-- Settings policies (admin only)
drop policy if exists "Admins can read settings" on public.automation_settings;
create policy "Admins can read settings"
  on public.automation_settings for select
  to authenticated
  using (public.current_user_role() = 'admin');

drop policy if exists "Admins can manage settings" on public.automation_settings;
create policy "Admins can manage settings"
  on public.automation_settings for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Worker heartbeat policies (all authenticated can read)
drop policy if exists "Authenticated users can read worker heartbeat" on public.worker_heartbeats;
create policy "Authenticated users can read worker heartbeat"
  on public.worker_heartbeats for select
  to authenticated
  using (true);

-- NOTE: Service role bypasses RLS. Worker must use service role key only in server/worker environment.
