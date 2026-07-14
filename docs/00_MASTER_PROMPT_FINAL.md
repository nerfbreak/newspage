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
