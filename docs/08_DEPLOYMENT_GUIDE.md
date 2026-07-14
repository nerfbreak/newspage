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
