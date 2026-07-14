import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/server/auth';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// POST /api/jobs/:id/retry
// Creates a new job cloning task_name and params from the original.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return apiError('unauthorized', 'Authentication required', 401);
  }

  const { id } = await params;
  const supabase = await createClient();

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return apiError('forbidden', 'Only operators and admins can retry jobs', 403);
  }

  // Fetch original job
  const { data: originalJob, error: fetchError } = await supabase
    .from('automation_jobs')
    .select('task_name, params, status')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) return apiError('internal_error', fetchError.message, 500);
  if (!originalJob) return apiError('not_found', 'Job not found', 404);

  if (!['failed', 'cancelled'].includes(originalJob.status)) {
    return apiError('conflict', 'Only failed or cancelled jobs can be retried', 409);
  }

  // Create new job with reference to original
  const newParams = {
    ...((originalJob.params as Record<string, unknown>) ?? {}),
    _retry_of: id,
  };

  const { data: newJob, error: createError } = await supabase
    .from('automation_jobs')
    .insert({
      task_name: originalJob.task_name,
      params: newParams,
      status: 'queued',
      triggered_by: user.id,
    })
    .select()
    .single();

  if (createError) return apiError('internal_error', createError.message, 500);

  return NextResponse.json({ job: newJob }, { status: 201 });
}
