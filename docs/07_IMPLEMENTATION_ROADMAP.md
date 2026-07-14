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
