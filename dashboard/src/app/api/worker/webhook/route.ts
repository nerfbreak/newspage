import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { workerWebhookSchema } from '@/lib/validations/jobs';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function verifyWorkerSecret(request: NextRequest): boolean {
  const secret = process.env.WORKER_SHARED_SECRET;
  if (!secret) return false;
  return request.headers.get('x-worker-secret') === secret;
}

// POST /api/worker/webhook
// Optional endpoint: worker can push updates through here
// instead of writing directly to Supabase.
export async function POST(request: NextRequest) {
  if (!verifyWorkerSecret(request)) {
    return apiError('unauthorized', 'Invalid or missing worker secret', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const parsed = workerWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Invalid payload', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { job_id, status, progress, error_message, result, log } = parsed.data;
  const supabase = createServiceClient();

  // Update job fields
  const jobUpdate: Record<string, unknown> = {};
  if (status !== undefined) {
    jobUpdate.status = status;
    if (status === 'running' && !jobUpdate.started_at) {
      // Ensure started_at is set
      const { data: existing } = await supabase
        .from('automation_jobs')
        .select('started_at')
        .eq('id', job_id)
        .single();
      if (!existing?.started_at) {
        jobUpdate.started_at = new Date().toISOString();
      }
    }
    if (['success', 'failed', 'cancelled'].includes(status)) {
      jobUpdate.finished_at = new Date().toISOString();
    }
  }
  if (progress !== undefined) jobUpdate.progress = progress;
  if (error_message !== undefined) jobUpdate.error_message = error_message;
  if (result !== undefined) jobUpdate.result = result;

  if (Object.keys(jobUpdate).length > 0) {
    const { error: updateError } = await supabase
      .from('automation_jobs')
      .update(jobUpdate)
      .eq('id', job_id);
    if (updateError) return apiError('internal_error', updateError.message, 500);
  }

  // Insert log entry if provided
  if (log) {
    const { error: logError } = await supabase.from('automation_logs').insert({
      job_id,
      level: log.level,
      message: log.message,
      metadata: log.metadata,
    });
    if (logError) return apiError('internal_error', logError.message, 500);
  }

  return NextResponse.json({ ok: true });
}
