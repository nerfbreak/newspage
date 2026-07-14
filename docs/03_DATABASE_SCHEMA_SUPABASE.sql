-- Supabase SQL Migration: Automation Dashboard
-- Enable required extension
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('admin', 'operator', 'viewer');
create type public.job_status as enum ('queued', 'running', 'success', 'failed', 'cancelled');
create type public.log_level as enum ('info', 'warning', 'error', 'success');

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jobs
create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  status public.job_status not null default 'queued',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  params jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  triggered_by uuid references auth.users(id) on delete set null,
  locked_by text,
  cancel_requested boolean not null default false,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Logs
create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.automation_jobs(id) on delete cascade,
  level public.log_level not null default 'info',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Settings
create table if not exists public.automation_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  is_secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Worker heartbeat
create table if not exists public.worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  worker_id text unique not null,
  status text not null default 'online',
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_jobs_updated_at
before update on public.automation_jobs
for each row execute function public.set_updated_at();

create trigger set_settings_updated_at
before update on public.automation_settings
for each row execute function public.set_updated_at();

create trigger set_worker_heartbeats_updated_at
before update on public.worker_heartbeats
for each row execute function public.set_updated_at();

-- Helper: current user's role
create or replace function public.current_user_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- Atomic job claim for worker using service role
create or replace function public.claim_next_queued_job(worker_id text)
returns public.automation_jobs as $$
declare
  claimed_job public.automation_jobs;
begin
  update public.automation_jobs
  set
    status = 'running',
    locked_by = worker_id,
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

-- Indexes
create index if not exists idx_jobs_status_created_at on public.automation_jobs(status, created_at desc);
create index if not exists idx_jobs_triggered_by on public.automation_jobs(triggered_by);
create index if not exists idx_logs_job_id_created_at on public.automation_logs(job_id, created_at asc);
create index if not exists idx_worker_heartbeats_last_seen on public.worker_heartbeats(last_seen_at desc);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.automation_logs enable row level security;
alter table public.automation_settings enable row level security;
alter table public.worker_heartbeats enable row level security;

-- Profiles policies
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Job policies
create policy "Authenticated users can read jobs"
on public.automation_jobs for select
to authenticated
using (true);

create policy "Operators and admins can create jobs"
on public.automation_jobs for insert
to authenticated
with check (public.current_user_role() in ('admin', 'operator'));

create policy "Operators and admins can update own controllable jobs"
on public.automation_jobs for update
to authenticated
using (public.current_user_role() in ('admin', 'operator'))
with check (public.current_user_role() in ('admin', 'operator'));

-- Logs policies
create policy "Authenticated users can read logs"
on public.automation_logs for select
to authenticated
using (true);

-- Settings policies
create policy "Admins can read settings"
on public.automation_settings for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Admins can manage settings"
on public.automation_settings for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Worker heartbeat policies
create policy "Authenticated users can read worker heartbeat"
on public.worker_heartbeats for select
to authenticated
using (true);

-- Service role bypasses RLS automatically. Worker should use service role only on server side.
