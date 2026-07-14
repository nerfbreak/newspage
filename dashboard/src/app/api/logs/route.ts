import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/server/auth';
import { listLogsSchema } from '@/lib/validations/jobs';

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// GET /api/logs
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return apiError('unauthorized', 'Authentication required', 401);
  }

  const { searchParams } = request.nextUrl;
  const parsed = listLogsSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Invalid query parameters', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { job_id, level, q, from, to } = parsed.data;
  const supabase = await createClient();

  let query = supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(500);

  if (job_id) query = query.eq('job_id', job_id);
  if (level) query = query.eq('level', level);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (q) query = query.ilike('message', `%${q}%`);

  const { data, error } = await query;
  if (error) return apiError('internal_error', error.message, 500);

  return NextResponse.json({ logs: data ?? [] });
}
