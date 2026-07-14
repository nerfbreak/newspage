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
