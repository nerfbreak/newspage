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
