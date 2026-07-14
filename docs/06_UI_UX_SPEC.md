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
