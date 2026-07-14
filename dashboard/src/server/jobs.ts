import { createClient } from '@/lib/supabase/server';
import { todayISO } from '@/lib/utils/date';
import type { DashboardStats, JobFilters, JobWithProfile, PaginatedJobs } from '@/types/jobs';
import type { AutomationJob } from '@/types/database';
import { DEFAULT_PAGE_LIMIT } from '@/lib/constants/statuses';

/**
 * Fetch dashboard summary stats.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = todayISO();

  const [jobsToday, running, success, failed, latest] = await Promise.all([
    supabase
      .from('automation_jobs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase
      .from('automation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'running'),
    supabase
      .from('automation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('created_at', today),
    supabase
      .from('automation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', today),
    supabase
      .from('automation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    jobsToday: jobsToday.count ?? 0,
    running: running.count ?? 0,
    success: success.count ?? 0,
    failed: failed.count ?? 0,
    latestJob: (latest.data as AutomationJob | null) ?? null,
  };
}

/**
 * Fetch paginated job list with optional filters.
 */
export async function getJobs(filters: JobFilters = {}): Promise<PaginatedJobs> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_PAGE_LIMIT;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('automation_jobs')
    .select(
      `
      *,
      profile:profiles!triggered_by(id, full_name)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.task_name) query = query.ilike('task_name', `%${filters.task_name}%`);
  if (filters.from) query = query.gte('created_at', filters.from);
  if (filters.to) query = query.lte('created_at', filters.to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    jobs: (data ?? []) as unknown as JobWithProfile[],
    total: count ?? 0,
    page,
    limit,
  };
}

/**
 * Fetch a single job by ID.
 */
export async function getJobById(id: string): Promise<AutomationJob | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('automation_jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as AutomationJob | null;
}

/**
 * Fetch recent jobs for dashboard (last N jobs).
 */
export async function getRecentJobs(n = 10): Promise<JobWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('automation_jobs')
    .select(
      `
      *,
      profile:profiles!triggered_by(id, full_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(n);

  if (error) throw error;
  return (data ?? []) as unknown as JobWithProfile[];
}
