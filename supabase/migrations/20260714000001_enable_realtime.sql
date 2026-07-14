-- Enable realtime for jobs and logs
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.automation_jobs;
alter publication supabase_realtime add table public.automation_logs;
