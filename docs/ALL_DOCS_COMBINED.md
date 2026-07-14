# Playwright Automation Dashboard - Complete Build Package

---

# 00_MASTER_PROMPT_FINAL.md

# Master Prompt Final - Codex / Antigravity

## Role
Act as a Senior Full-Stack Engineer, UI/UX Engineer, and DevOps Architect. Build a production-ready full-stack automation dashboard from scratch.

## Context
I already have a working Streamlit + Supabase project for automating my daily work. The current app works, including the automation logic and Supabase workflow, but the UI/UX is limited. I want to migrate and upgrade it into a modern full-stack web app.

## Target Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, Postgres, Realtime, Storage if needed
- Vercel Free/Hobby for dashboard hosting
- Separate Playwright worker for long-running automation
- Manual job trigger, live monitoring, logs, result history, retry, cancel

## Non-negotiable Architecture Rule
Do not run long Playwright jobs directly inside Vercel functions. Vercel should host the dashboard and lightweight API handlers only. Use Supabase as the queue/state/log layer and run Playwright in a separate worker.

## Build Sequence
1. Inspect old Streamlit project as reference.
2. Identify existing Supabase tables, env variables, automation flow, task inputs/outputs, logs, failures, and user workflow.
3. Create migration analysis.
4. Build new Next.js app from scratch.
5. Implement Supabase Auth, protected routes, profiles, roles.
6. Implement automation job queue, logs, realtime updates.
7. Implement manual trigger, job list, job detail, logs, settings.
8. Implement worker contract and sample worker skeleton.
9. Add migrations, seed data, README, deployment guide, and env docs.
10. Verify local dev with `pnpm dev`.

## Core Deliverables
- Modern dashboard UI
- Supabase Auth
- Jobs page
- Job detail with live logs
- Manual trigger flow
- API route handlers
- SQL migrations + RLS policies
- Worker integration documentation
- Deployment guide for Vercel + Supabase + Worker
- Environment variable checklist
- Migration notes from Streamlit

## Quality Rules
- Strict TypeScript
- Avoid `any`
- Use reusable components
- Add validation with Zod
- Never expose service role key to browser
- Never expose work portal credentials to frontend
- Never log secrets, passwords, cookies, or tokens
- Keep the architecture simple, stable, and free-tier friendly
- Use pnpm
- Use shadcn/ui components wherever appropriate

---

# 01_PRD.md

# PRD - Web-Based Playwright Automation System

## 1. Ringkasan Produk
Produk ini adalah dashboard web modern untuk menggantikan UI Streamlit lama yang digunakan untuk menjalankan otomatisasi kerja harian. Aplikasi baru dibangun dengan Next.js, TypeScript, Tailwind CSS, shadcn/ui, dan Supabase. Dashboard berjalan di Vercel, sementara proses Playwright yang berdurasi panjang berjalan di worker terpisah.

## 2. Latar Belakang
Sistem Streamlit lama sudah berhasil menjalankan business logic dan automasi harian. Namun, Streamlit membatasi fleksibilitas UI/UX, komponen dashboard, layout modern, dan pengalaman monitoring real-time. Migrasi ini bertujuan mempertahankan automation flow yang sudah jalan sambil meningkatkan tampilan, struktur kode, observability, dan maintainability.

## 3. Tujuan
- Membuat dashboard modern untuk trigger automation secara manual.
- Menampilkan status job secara real-time.
- Menyediakan riwayat job, log, error, result summary, retry, dan cancel.
- Memisahkan dashboard dan long-running worker agar stabil di free tier.
- Menjaga Supabase sebagai pusat Auth, Database, Realtime, dan queue/state.
- Memudahkan deployment ke Vercel dan Supabase free tier.

## 4. Non-Tujuan
- Tidak membuat cron/scheduler otomatis pada versi awal.
- Tidak menjalankan Playwright jangka panjang langsung di Vercel Function.
- Tidak mengganti semua business logic Playwright jika logic lama masih valid.
- Tidak membuat multi-tenant enterprise system pada versi awal.
- Tidak menyimpan credentials portal kerja di frontend.

## 5. Target User
### Admin
Mengatur user, role, konfigurasi worker, dan memantau semua job.

### Operator
Menjalankan automation, melihat progress, membaca log, retry job gagal.

### Viewer
Hanya melihat dashboard, job history, dan log tanpa akses trigger.

## 6. Use Case Utama
1. User login ke dashboard.
2. User klik Run Automation.
3. Sistem membuat job baru dengan status `queued`.
4. Worker mengambil job dari Supabase.
5. Worker menjalankan Playwright.
6. Worker update status, progress, logs, dan result.
7. User melihat progress dan log secara real-time.
8. Jika gagal, user bisa membaca error dan retry.

## 7. Fitur Utama
### 7.1 Authentication
- Login menggunakan Supabase Auth.
- Protected dashboard routes.
- Session handling.
- Role-ready structure: admin, operator, viewer.

### 7.2 Dashboard Overview
- Total jobs hari ini.
- Running jobs.
- Successful jobs.
- Failed jobs.
- Latest run.
- Recent activity.
- Worker status/heartbeat.
- Quick action untuk Run Automation.

### 7.3 Jobs Management
- Tabel job dengan filter status, tanggal, task name.
- Detail kolom: ID, task name, status, progress, triggered by, started at, finished at, duration, result summary.
- Action: view detail, retry, cancel.

### 7.4 Job Detail
- Metadata job.
- Status badge real-time.
- Progress bar.
- Live logs.
- Error details.
- Result JSON/summary.
- Optional artifacts: screenshot/export files.
- Retry button.

### 7.5 Manual Trigger
- Modal/page untuk memilih task type.
- Form optional parameters.
- Confirmation dialog.
- Membuat job `queued`.
- Redirect ke job detail.

### 7.6 Logs
- Live logs dari Supabase.
- Search/filter by job, level, message, date.
- Terminal-like mode.
- Log levels: info, warning, error, success.

### 7.7 Settings
- Supabase connection status.
- Worker webhook URL.
- Worker heartbeat status.
- Automation config.
- Env variable documentation.
- Team/role settings optional.

## 8. Success Metrics
- User bisa menjalankan automation manual dari dashboard.
- Progress dan log muncul real-time.
- Job yang gagal memiliki error message jelas.
- Job history tersimpan dan bisa difilter.
- Worker tidak bergantung pada Vercel function untuk proses panjang.
- App bisa deploy di Vercel dan jalan lokal dengan `pnpm dev`.

## 9. Constraints
- Tetap free-tier friendly.
- Vercel hanya untuk dashboard dan lightweight API.
- Supabase sebagai database utama.
- Worker terpisah untuk Playwright.
- Tidak ada cron pada MVP.

## 10. Acceptance Criteria
- Login berjalan dan dashboard terlindungi.
- User bisa membuat job baru.
- Job tersimpan di `automation_jobs`.
- Worker bisa membaca job `queued`.
- Worker bisa update status, progress, logs, result, dan error.
- Dashboard update otomatis via realtime.
- Retry failed job membuat job baru atau reset job sesuai strategi.
- Cancel hanya berlaku untuk `queued` atau `running` dengan cooperative cancellation.
- Semua secret hanya ada di environment/server/worker.

---

# 02_TECHNICAL_DESIGN.md

# Technical Design Document

## 1. Arsitektur Tingkat Tinggi

```text
User Browser
   |
   v
Next.js Dashboard on Vercel
   |-- Supabase Auth client/server
   |-- Route Handlers for lightweight API
   |-- Realtime subscriptions
   |
   v
Supabase
   |-- Auth
   |-- Postgres tables
   |-- Realtime changes
   |-- Storage optional
   |
   v
External Playwright Worker
   |-- Poll queued jobs or receive webhook
   |-- Run automation
   |-- Update status/progress/logs/result
```

## 2. Komponen Sistem
### 2.1 Frontend
- Next.js App Router.
- Server Components untuk data awal.
- Client Components untuk realtime subscriptions, table interactions, dialogs, and forms.
- shadcn/ui untuk komponen dashboard.
- Tailwind CSS untuk styling.

### 2.2 Backend Next.js
- Route Handlers di `src/app/api/*`.
- Validasi payload dengan Zod.
- Supabase server client untuk operasi authenticated.
- Tidak menjalankan Playwright job panjang.

### 2.3 Supabase
- Auth untuk login.
- Postgres untuk profiles, jobs, logs, settings, worker heartbeat.
- Realtime untuk update jobs/logs.
- Storage optional untuk screenshots/export.

### 2.4 Worker
- Bisa Python Playwright atau Node.js Playwright.
- Berjalan di luar Vercel.
- Menggunakan Supabase service role key hanya di server/worker environment.
- Polling interval default: 5-15 detik.
- Menggunakan lock/claim job supaya tidak ada double processing.

## 3. Data Flow Manual Trigger
1. User submit form Run Automation.
2. POST `/api/jobs` membuat job status `queued`.
3. Worker polling `automation_jobs where status = queued`.
4. Worker claim job via RPC/function atau atomic update.
5. Worker set `running`, tulis log awal, update progress.
6. Worker selesai: set `success` + result atau `failed` + error.
7. UI receive realtime changes.

## 4. Folder Structure
```text
src/
  app/
    (auth)/
      login/
        page.tsx
    (dashboard)/
      layout.tsx
      dashboard/page.tsx
      jobs/page.tsx
      jobs/[id]/page.tsx
      logs/page.tsx
      settings/page.tsx
    api/
      jobs/route.ts
      jobs/[id]/route.ts
      jobs/[id]/retry/route.ts
      jobs/[id]/cancel/route.ts
      logs/route.ts
      worker/heartbeat/route.ts
      worker/webhook/route.ts
  components/
    layout/
    dashboard/
    jobs/
    logs/
    settings/
    ui/
  hooks/
    use-job-realtime.ts
    use-logs-realtime.ts
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    validations/
      jobs.ts
      settings.ts
    constants/
      statuses.ts
    utils/
      duration.ts
      date.ts
  server/
    jobs.ts
    logs.ts
    auth.ts
  types/
    database.ts
    jobs.ts
```

## 5. Rendering Strategy
- Dashboard summary: server fetch + client refresh optional.
- Job table: server fetch initial, client filter via search params/API.
- Job detail logs: server initial + realtime subscription.
- Settings: server fetch with role check.

## 6. Realtime Strategy
- Subscribe to `automation_jobs` update filtered by job ID for detail page.
- Subscribe to `automation_logs` insert filtered by job ID for live logs.
- Dashboard overview can refresh periodically or subscribe to relevant job changes.

## 7. Error Handling
- API returns typed errors: validation_error, unauthorized, forbidden, not_found, conflict, internal_error.
- Worker writes final `error_message` and structured `result.error`.
- UI shows error alert and retry button for failed jobs.

## 8. Observability
- `automation_logs` for domain logs.
- `worker_heartbeats` for worker online/offline state.
- `automation_jobs.result` stores summary counts, duration, processed records, failed records.

## 9. Security Design
- Browser only receives anon key.
- Service role only in Vercel server environment or worker, never browser.
- Work portal credentials only in worker environment.
- RLS enabled for tables.
- Role checks for admin-only settings.
- Logs scrub sensitive values.

---

# 03_DATABASE_SCHEMA_SUPABASE.sql

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

---

# 04_API_CONTRACT.md

# API Contract

Base path: `/api`

## Authentication
All dashboard APIs require authenticated Supabase session unless explicitly marked as worker endpoint.

## Error Response Shape
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request payload",
    "details": {}
  }
}
```

## POST /api/jobs
Create new queued automation job.

### Request
```json
{
  "task_name": "daily_stock_compare",
  "params": {
    "date": "2026-07-13",
    "limit": 200
  }
}
```

### Response 201
```json
{
  "job": {
    "id": "uuid",
    "task_name": "daily_stock_compare",
    "status": "queued",
    "progress": 0,
    "created_at": "timestamp"
  }
}
```

## GET /api/jobs
List jobs with filters.

### Query Params
- `status`: queued|running|success|failed|cancelled
- `task_name`: string
- `from`: ISO date
- `to`: ISO date
- `page`: number
- `limit`: number

## GET /api/jobs/:id
Get job detail.

## POST /api/jobs/:id/retry
Retry failed/cancelled job. Recommended behavior: create a new job copying task_name and params from old job, and link old job ID in params metadata.

## POST /api/jobs/:id/cancel
Request cancellation. If status is `queued`, set status to `cancelled`. If status is `running`, set `cancel_requested = true`; worker must check this flag cooperatively.

## GET /api/logs
Fetch logs.

### Query Params
- `job_id`: uuid optional
- `level`: info|warning|error|success optional
- `q`: text search optional
- `from`: ISO date optional
- `to`: ISO date optional

## POST /api/worker/heartbeat
Worker heartbeat endpoint.

### Request
```json
{
  "worker_id": "home-worker-01",
  "status": "online",
  "metadata": {
    "version": "1.0.0",
    "runtime": "python-playwright"
  }
}
```

### Security
Use a worker shared secret header:
`x-worker-secret: <WORKER_SHARED_SECRET>`

## POST /api/worker/webhook
Optional endpoint if worker pushes updates through API instead of writing directly to Supabase.

### Request
```json
{
  "job_id": "uuid",
  "status": "running",
  "progress": 45,
  "log": {
    "level": "info",
    "message": "Processed 90/200 records",
    "metadata": {}
  }
}
```

---

# 05_WORKER_CONTRACT.md

# Playwright Worker Contract

## 1. Purpose
Worker menjalankan automation Playwright di luar Vercel. Dashboard hanya membuat job dan memantau state. Supabase menjadi queue, state store, dan log store.

## 2. Worker Responsibilities
- Poll Supabase for `queued` jobs.
- Claim one job atomically.
- Set job status to `running`.
- Run Playwright automation.
- Write logs to `automation_logs`.
- Update progress to `automation_jobs.progress`.
- Respect cancellation requests.
- Save result JSON.
- Set final status to `success`, `failed`, or `cancelled`.
- Send heartbeat periodically.

## 3. Recommended Worker Loop
```text
while true:
  send heartbeat
  job = claim_next_queued_job(worker_id)
  if no job:
    sleep(5-15 seconds)
    continue
  run job
```

## 4. Job Claiming
Use RPC `claim_next_queued_job(worker_id)` to avoid two workers running the same job.

## 5. Log Format
Every important step should insert row into `automation_logs`:
```json
{
  "job_id": "uuid",
  "level": "info",
  "message": "Login successful",
  "metadata": {
    "step": "login"
  }
}
```

## 6. Result Format
Recommended result JSON:
```json
{
  "total_records": 200,
  "processed_records": 200,
  "success_count": 198,
  "failed_count": 2,
  "duration_seconds": 540,
  "artifacts": [],
  "summary": "Processed 200 records, 198 successful, 2 failed"
}
```

## 7. Error Format
```json
{
  "error_type": "PortalLoginError",
  "message": "Failed to login to work portal",
  "step": "login",
  "retryable": true
}
```

## 8. Cancellation
Dashboard sets:
```text
cancel_requested = true
```
Worker must check the flag between major steps. If detected, worker stops gracefully and sets status to `cancelled`.

## 9. Credentials
Worker stores portal credentials in environment variables only:
- `PORTAL_USERNAME`
- `PORTAL_PASSWORD`
- `PORTAL_URL`
- other automation-specific secrets

Never write credentials to Supabase logs, results, screenshots, or frontend.

## 10. Worker Deployment Options
Recommended order:
1. Existing Streamlit/Python environment as temporary worker fallback.
2. Home VPS / Rumahweb VPS if available.
3. Free Python/Node worker hosting if job duration is supported.
4. Paid worker only if free options become unstable.

## 11. Worker Health
Worker sends heartbeat every 30-60 seconds:
- worker_id
- status
- version
- runtime
- last_seen_at

Dashboard marks worker offline if last_seen_at older than threshold, e.g. 2-5 minutes.

---

# 06_UI_UX_SPEC.md

# UI/UX Specification

## 1. Style Direction
Modern SaaS dashboard: clean, compact, professional, responsive, dark-mode ready.

## 2. Layout
- Sidebar navigation left.
- Topbar with page title, quick run button, user menu.
- Main content with cards and data tables.
- Mobile: sidebar becomes sheet/drawer.

## 3. Navigation
- Dashboard
- Jobs
- Logs
- Settings

## 4. Components
Use shadcn/ui:
- Button
- Card
- Badge
- Table / Data Table
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Progress
- Alert
- Skeleton
- Input
- Select
- Textarea
- Form
- Sonner/Toast

## 5. Status Visuals
- queued: neutral badge
- running: active badge + progress
- success: success badge
- failed: destructive badge
- cancelled: muted badge

## 6. Dashboard Page
Cards:
- Jobs Today
- Running
- Success
- Failed
- Latest Run
- Worker Status

Sections:
- Recent Jobs table
- Recent Errors
- Quick Run Automation

## 7. Jobs Page
- Filter toolbar
- Search task name
- Status select
- Date range
- Data table
- Row actions: View, Retry, Cancel

## 8. Job Detail Page
Header:
- Task name
- Status badge
- Created time
- Triggered by

Main:
- Progress bar
- Metadata card
- Result card
- Error card if failed
- Live log stream

## 9. Logs Page
- Terminal-like log stream
- Filter by job, level, text, date
- Auto-scroll toggle
- Copy logs button optional

## 10. Settings Page
- Worker status
- Worker webhook config
- Environment checklist
- Supabase status
- Team/role settings optional

## 11. Empty States
- No jobs yet: show CTA Run Automation.
- No logs yet: show waiting indicator.
- Worker offline: show warning and guide.

## 12. Loading States
- Skeleton cards on dashboard.
- Skeleton table rows on jobs.
- Spinner only for short actions.
- Toast after trigger/retry/cancel.

---

# 07_IMPLEMENTATION_ROADMAP.md

# Implementation Roadmap

## Phase 0 - Migration Audit
- Read existing Streamlit code.
- Identify automation functions.
- Identify Supabase tables and fields.
- Identify env variables.
- Identify task parameters and output format.
- Document old flow and migration assumptions.

## Phase 1 - Project Setup
- Create Next.js app with TypeScript, Tailwind, App Router, src directory.
- Install shadcn/ui.
- Configure ESLint, Prettier, pnpm.
- Add `.env.example`.
- Add basic layout.

## Phase 2 - Supabase Foundation
- Install Supabase packages.
- Add browser/server Supabase clients.
- Add middleware for protected routes.
- Add SQL migrations.
- Enable RLS.
- Create seed/admin setup instructions.

## Phase 3 - Auth and Layout
- Login page.
- Protected dashboard layout.
- Sidebar/topbar.
- User menu.
- Role-aware nav.

## Phase 4 - Jobs Core
- Create job API.
- List jobs API.
- Job detail API.
- Retry/cancel APIs.
- Zod validation.
- Server actions or route handlers as appropriate.

## Phase 5 - Dashboard UI
- Summary cards.
- Recent jobs table.
- Worker status.
- Quick trigger.

## Phase 6 - Jobs and Logs UI
- Jobs data table.
- Filters.
- Job detail.
- Live logs with Supabase Realtime.
- Error/result cards.

## Phase 7 - Worker Integration
- Implement RPC claim job.
- Create sample worker skeleton.
- Add heartbeat.
- Add cancellation support.
- Add result/error structure.

## Phase 8 - Settings and Security
- Settings page.
- Worker config display.
- Environment checklist.
- Role/admin controls.
- Secret scrubbing.

## Phase 9 - Deployment
- Deploy Supabase migrations.
- Deploy Next.js to Vercel.
- Configure environment variables.
- Deploy or run worker externally.
- Smoke test full flow.

## Phase 10 - Stabilization
- Add tests for validation/utilities.
- Improve error messages.
- Add pagination/index tuning.
- Add artifact support if needed.
- Add backup/export if needed.

---

# 08_DEPLOYMENT_GUIDE.md

# Deployment Guide - Vercel + Supabase + Worker

## 1. Supabase Setup
1. Create Supabase project.
2. Run SQL migration from `03_DATABASE_SCHEMA_SUPABASE.sql`.
3. Enable Auth provider, at minimum email/password.
4. Create first user.
5. Insert profile row and set role `admin`.
6. Enable Realtime for required tables:
   - automation_jobs
   - automation_logs
   - worker_heartbeats

## 2. Vercel Setup
1. Push Next.js repository to GitHub.
2. Import project into Vercel.
3. Add environment variables.
4. Deploy.
5. Test login.
6. Test create job.

## 3. Worker Setup
1. Choose worker runtime: Python Playwright or Node Playwright.
2. Add Supabase service role key to worker environment only.
3. Add portal credentials to worker environment only.
4. Install Playwright browsers.
5. Start worker process.
6. Confirm heartbeat appears in dashboard.
7. Trigger test job.

## 4. Production Smoke Test
- Login works.
- Dashboard loads.
- Worker online.
- Create job.
- Job becomes running.
- Logs stream live.
- Job completes success/failed correctly.
- Retry works.
- Cancel queued works.
- Running cancellation is respected by worker.

## 5. Free-Tier Notes
- Keep Vercel for dashboard and lightweight API only.
- Avoid long-running work inside serverless route handlers.
- Keep logs compact.
- Avoid excessive realtime subscriptions.
- Archive or clean old logs if volume grows.

---

# 09_ENV_AND_SECURITY_CHECKLIST.md

# Environment Variables and Security Checklist

## Next.js / Vercel Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WORKER_SHARED_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Worker Environment Variables
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
WORKER_ID=home-worker-01
WORKER_SHARED_SECRET=
PORTAL_URL=
PORTAL_USERNAME=
PORTAL_PASSWORD=
```

## Security Checklist
- [ ] Service role key never used in browser/client component.
- [ ] Portal credentials only stored in worker environment.
- [ ] `.env` is gitignored.
- [ ] `.env.example` contains placeholders only.
- [ ] RLS enabled for all public tables.
- [ ] Role checks implemented for settings/admin pages.
- [ ] API inputs validated with Zod.
- [ ] Logs scrub sensitive strings.
- [ ] Screenshots/artifacts do not expose secrets.
- [ ] Worker endpoints use shared secret.
- [ ] Cancel/retry endpoints validate user role.
- [ ] Realtime subscriptions only expose allowed data.

## Suggested Secret Scrubbing
Before writing any log, replace values matching:
- password
- token
- cookie
- authorization header
- session id
- portal credential values

---

# 10_MIGRATION_PLAN.md

# Migration Plan from Streamlit to Next.js

## 1. Audit Existing Streamlit Project
Collect:
- Pages and UI flows.
- Current automation scripts.
- Current Supabase tables.
- Current queries/inserts/updates.
- Existing env variables.
- Login/session assumptions.
- Current task inputs.
- Current result outputs.
- Current error handling.

## 2. Map Old to New
| Old Streamlit | New Next.js |
|---|---|
| Streamlit page | App Router page |
| Streamlit button trigger | Manual trigger modal/page |
| Streamlit status text | Realtime job status badge |
| Streamlit logs/output | automation_logs table + live log stream |
| Existing Supabase tables | Adapted migrations or compatibility views |
| Python automation function | External worker task handler |

## 3. Preserve Business Logic
Keep working Playwright logic as much as possible. Refactor only boundaries:
- input parsing
- logging
- progress updates
- result writing
- error handling

## 4. Migration Steps
1. Freeze old Streamlit version as reference.
2. Export or document current Supabase schema.
3. Create new Supabase migrations.
4. Build Next.js dashboard.
5. Wrap old automation logic into worker contract.
6. Test with small sample data.
7. Test with real 200-data workload.
8. Compare output with old app.
9. Switch team usage to new dashboard.
10. Keep old Streamlit as fallback until stable.

## 5. Compatibility Strategy
If old tables already exist, choose one:
- Option A: create new tables and migrate data.
- Option B: adapt current tables and add missing fields.
- Option C: keep old tables for business data, add new tables only for jobs/logs.

Recommended: Option C for lowest migration risk.

## 6. Cutover Checklist
- [ ] All env variables configured.
- [ ] Admin user exists.
- [ ] Worker online.
- [ ] Test job success.
- [ ] Failed job produces useful error.
- [ ] Retry works.
- [ ] Old Streamlit fallback still available.
- [ ] Team trained on new UI.
