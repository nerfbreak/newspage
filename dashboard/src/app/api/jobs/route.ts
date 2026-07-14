import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createJobSchema, listJobsSchema } from '@/lib/validations/jobs';
import { requireAuth } from '@/server/auth';

function apiError(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

// GET /api/jobs
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return apiError('unauthorized', 'Authentication required', 401);
  }

  const { searchParams } = request.nextUrl;
  const parsed = listJobsSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return apiError('validation_error', 'Invalid query parameters', 400, parsed.error.flatten());
  }

  const { status, task_name, from, to, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from('automation_jobs')
    .select('*, profile:profiles!triggered_by(id, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (task_name) query = query.ilike('task_name', `%${task_name}%`);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, count, error } = await query;
  if (error) return apiError('internal_error', error.message, 500);

  return NextResponse.json({ jobs: data ?? [], total: count ?? 0, page, limit });
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return apiError('unauthorized', 'Authentication required', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('validation_error', 'Invalid request payload', 400, parsed.error.flatten());
  }

  const { task_name, params } = parsed.data;

  // Check role: only admin and operator can create jobs
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return apiError('forbidden', 'Only operators and admins can create jobs', 403);
  }

  const { data: job, error } = await supabase
    .from('automation_jobs')
    .insert({
      task_name,
      params,
      status: 'queued',
      triggered_by: user.id,
    })
    .select()
    .single();

  if (error) return apiError('internal_error', error.message, 500);

  return NextResponse.json({ job }, { status: 201 });
}
