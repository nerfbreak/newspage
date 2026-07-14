# Playwright Worker — Integration Guide

This directory contains the **worker** that runs Playwright automation outside of Vercel.

## Architecture

```
Dashboard (Vercel)  ←→  Supabase  ←→  Worker (this machine)
     creates jobs          ↑              polls & executes
     shows live logs       │              writes logs/progress
                    worker_heartbeats
```

## Quick Start

### 1. Install dependencies

```bash
pip install supabase python-dotenv playwright
playwright install chromium
```

### 2. Configure environment

Copy `.env.example` from the repo root and fill in your values:

```bash
# Worker-specific .env (keep separate from dashboard)
SUPABASE_URL=https://xvtamojctwfdqzoftdob.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
WORKER_ID=home-worker-01
WORKER_SHARED_SECRET=<same-as-dashboard-WORKER_SHARED_SECRET>
NEXT_PUBLIC_APP_URL=https://your-dashboard.vercel.app
PORTAL_URL=<work-portal-url>
PORTAL_USERNAME=<work-portal-username>
PORTAL_PASSWORD=<work-portal-password>
```

> ⚠️ **Never** commit this file. It contains secrets.

### 3. Integrate your Playwright logic

Open `worker_skeleton.py` and wrap your existing automation functions:

```python
def run_inventory_adjustment(job_id: str, params: dict) -> dict:
    # Import your existing Playwright code
    from your_module import playwright_engine
    return playwright_engine.run_adjustment(...)
```

The skeleton already handles:
- Atomic job claiming (`claim_next_queued_job` RPC)
- Log writing to `automation_logs`
- Progress updates to `automation_jobs.progress`
- Cancellation flag checking
- Error handling and status updates
- Heartbeat sending

### 4. Run the worker

```bash
python worker_skeleton.py
```

Or as a background service:
```bash
nohup python worker_skeleton.py &> worker.log &
```

---

## Worker Contract

### Job Claim (Atomic)

```sql
SELECT * FROM claim_next_queued_job('home-worker-01');
```

This atomically updates the job to `running` and returns it. Safe for concurrent workers.

### Log Format

```json
{
  "job_id": "uuid",
  "level": "info",
  "message": "Login successful",
  "metadata": { "step": "login" }
}
```

Levels: `info`, `warning`, `error`, `success`

### Progress Updates

Call `update_job(job_id, progress=N)` where N is 0–100.

### Cancellation (Cooperative)

Check `is_cancel_requested(job_id)` between major steps. If true, raise `CancelledError`.

### Result Format

```json
{
  "total_records": 200,
  "processed_records": 200,
  "success_count": 198,
  "failed_count": 2,
  "duration_seconds": 540,
  "summary": "Processed 200 records, 198 successful, 2 failed"
}
```

### Heartbeat

Worker sends a POST to `/api/worker/heartbeat` every 30 seconds:

```json
{
  "worker_id": "home-worker-01",
  "status": "online",
  "metadata": { "version": "1.0.0", "runtime": "python-playwright" }
}
```

Header: `x-worker-secret: <WORKER_SHARED_SECRET>`

The dashboard marks the worker **offline** if no heartbeat is received for 5 minutes.

---

## Security Rules

- **Service role key**: Only in worker environment. Never in browser.
- **Portal credentials**: Only in worker environment. Never in logs, results, or screenshots.
- **Log scrubbing**: Always sanitize error messages before writing to `automation_logs`.
- **No secrets in DB**: `error_message`, `result`, `metadata` must not contain passwords, tokens, or cookies.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Worker not appearing in dashboard | Check heartbeat endpoint URL, shared secret, and network access |
| Job stuck in `running` | Worker crashed — check worker logs. Restart worker and retry job. |
| `claim_next_queued_job` returns null | No queued jobs. Normal behavior. |
| Playwright browser error | Run `playwright install chromium` again |
| Auth error from Supabase | Check `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not anon key) |
