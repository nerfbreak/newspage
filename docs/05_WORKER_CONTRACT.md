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
