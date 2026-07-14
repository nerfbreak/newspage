import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/server/auth';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// POST /api/jobs/:id/cancel
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
    return apiError('forbidden', 'Only operators and admins can cancel jobs', 403);
  }

  // Fetch current job
  const { data: job, error: fetchError } = await supabase
    .from('automation_jobs')
    .select('status')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) return apiError('internal_error', fetchError.message, 500);
  if (!job) return apiError('not_found', 'Job not found', 404);

  if (!['queued', 'running'].includes(job.status)) {
    return apiError('conflict', 'Only queued or running jobs can be cancelled', 409);
  }

  let updatePayload: Record<string, unknown>;

  if (job.status === 'queued') {
    // Immediately cancel
    updatePayload = { status: 'cancelled', finished_at: new Date().toISOString() };
  } else {
    // Running: set cooperative cancellation flag
    updatePayload = { cancel_requested: true };
  }

  const { data: updated, error: updateError } = await supabase
    .from('automation_jobs')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) return apiError('internal_error', updateError.message, 500);

  return NextResponse.json({ job: updated });
}
