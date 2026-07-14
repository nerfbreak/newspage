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
