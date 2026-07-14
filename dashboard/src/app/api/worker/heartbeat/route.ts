import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { workerHeartbeatSchema } from '@/lib/validations/jobs';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function verifyWorkerSecret(request: NextRequest): boolean {
  const secret = process.env.WORKER_SHARED_SECRET;
  if (!secret) return false; // If not configured, reject all
  return request.headers.get('x-worker-secret') === secret;
}

// POST /api/worker/heartbeat
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

  const parsed = workerHeartbeatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Invalid payload', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { worker_id, status, metadata } = parsed.data;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('worker_heartbeats')
    .upsert(
      {
        worker_id,
        status,
        metadata,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'worker_id' }
    )
    .select()
    .single();

  if (error) return apiError('internal_error', error.message, 500);

  return NextResponse.json({ heartbeat: data });
}
