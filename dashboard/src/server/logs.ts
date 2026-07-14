import { createClient } from '@/lib/supabase/server';
import type { AutomationLog } from '@/types/database';
import type { LogFilters } from '@/types/jobs';

/**
 * Fetch logs with optional filters.
 */
export async function getLogs(filters: LogFilters = {}): Promise<AutomationLog[]> {
  const supabase = await createClient();

  let query = supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(500);

  if (filters.job_id) query = query.eq('job_id', filters.job_id);
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.from) query = query.gte('created_at', filters.from);
  if (filters.to) query = query.lte('created_at', filters.to);
  if (filters.q) query = query.ilike('message', `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AutomationLog[];
}

/**
 * Fetch logs for a specific job.
 */
export async function getJobLogs(jobId: string): Promise<AutomationLog[]> {
  return getLogs({ job_id: jobId });
}
