import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/server/auth';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// GET /api/jobs/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return apiError('unauthorized', 'Authentication required', 401);
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('automation_jobs')
    .select('*, profile:profiles!triggered_by(id, full_name)')
    .eq('id', id)
    .maybeSingle();

  if (error) return apiError('internal_error', error.message, 500);
  if (!job) return apiError('not_found', 'Job not found', 404);

  // Fetch logs for this job
  const { data: logs } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ job, logs: logs ?? [] });
}
