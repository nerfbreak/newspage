# Automation Dashboard

Modern web dashboard for monitoring and triggering Playwright automation jobs. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Architecture

```
Browser  →  Next.js Dashboard (Vercel)  →  Supabase (Auth + DB + Realtime)
                                                  ↕
                                    Playwright Worker (your machine/VPS)
```

- **Dashboard** (this repo, `dashboard/`): UI + lightweight API routes — hosted on Vercel
- **Supabase**: Auth, job queue, logs, worker heartbeats — free tier
- **Worker** (`worker/`): Python Playwright automation — runs on your machine or VPS

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase project
- Python 3.10+ (for worker)

### 1. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in the Supabase SQL Editor:
   ```
   supabase/migrations/20260713000001_automation_dashboard.sql
   ```
3. Enable **Realtime** for these tables:
   - `automation_jobs`
   - `automation_logs`
   - `worker_heartbeats`
4. Enable Auth → Email/Password provider
5. Create your first user via Auth → Users
6. Run `supabase/seed.sql` to promote your user to `admin`

### 2. Set up the dashboard

```bash
cd dashboard
cp .env.example .env.local
# Fill in your Supabase URL, anon key, service role key, and worker secret
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Set up the worker

```bash
cd worker
pip install supabase python-dotenv playwright
playwright install chromium
# Create .env file with worker credentials (see worker/README.md)
python worker_skeleton.py
```

## Directory Structure

```
dashboard/              # Next.js application
  src/
    app/
      (auth)/login/     # Login page
      (dashboard)/      # Protected dashboard pages
        dashboard/      # Overview with stats
        jobs/           # Job list + detail
        logs/           # Log viewer
        settings/       # Admin settings
      api/              # Route handlers
        jobs/           # CRUD + retry/cancel
        logs/           # Log fetch
        worker/         # Heartbeat + webhook
    components/         # UI components
    hooks/              # Realtime hooks
    lib/                # Supabase clients, utils, validation
    server/             # Server-side data fetchers
    types/              # TypeScript types
  .env.example
supabase/
  migrations/           # SQL schema + RLS
  seed.sql              # First admin setup
worker/
  worker_skeleton.py    # Python worker template
  README.md             # Worker integration guide
legacy-streamlit/       # Original app (reference only)
docs/                   # Architecture documentation
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set environment variables (from `.env.example`)
4. Deploy

### Worker

See [worker/README.md](./worker/README.md) for full worker deployment guide.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server only) | Service role key — never in browser |
| `WORKER_SHARED_SECRET` | Vercel + Worker | Shared secret for worker API auth |
| `NEXT_PUBLIC_APP_URL` | Vercel | Public dashboard URL |
| `PORTAL_USERNAME` | Worker only | Work portal login |
| `PORTAL_PASSWORD` | Worker only | Work portal password |
| `PORTAL_URL` | Worker only | Work portal base URL |

## Security

- Service role key is **server-only** — never sent to the browser
- Portal credentials live **only on the worker machine** — never in Supabase, never in logs
- All dashboard API routes require authenticated Supabase session
- Worker endpoints are authenticated via `x-worker-secret` header
- RLS enabled on all Supabase tables
- Inputs validated with Zod

## Tasks

| Task Name | Legacy Page |
|---|---|
| `inventory_adjustment` | Inventory Adjustment |
| `sales_extraction` | Sales Extraction |
| `promotion_comparison` | Promotion Comparison |
| `stock_mutation` | Stock Mutation |
| `clearance_stock` | Clearance Stock |
| `initial_stock` | Initial Stock |
