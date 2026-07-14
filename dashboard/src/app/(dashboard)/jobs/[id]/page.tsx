import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJobById } from '@/server/jobs';
import { getJobLogs } from '@/server/logs';
import { getCurrentUserProfile } from '@/server/auth';
import { JobDetailHeader } from '@/components/jobs/job-detail-header';
import { JobProgress } from '@/components/jobs/job-progress';
import { JobResultCard } from '@/components/jobs/job-result-card';
import { JobErrorCard } from '@/components/jobs/job-error-card';
import { LiveLogs } from '@/components/jobs/live-logs';
import type { JobResult } from '@/types/database';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Job ${id.slice(0, 8)}…` };
}

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();
  
  const [job, logs] = await Promise.all([
    getJobById(id),
    getJobLogs(id),
  ]);

  if (!job) notFound();

  let triggeredByName: string | null = null;
  if (job.triggered_by) {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabaseClient = createServiceClient();
    const { data } = await supabaseClient.from('profiles').select('full_name').eq('id', job.triggered_by).maybeSingle();
    triggeredByName = data?.full_name ?? null;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <JobDetailHeader initialJob={job} triggeredByName={triggeredByName} />

      {/* Progress */}
      <JobProgress initialJob={job} />

      {/* Error */}
      {job.status === 'failed' && (
        <JobErrorCard
          jobId={job.id}
          errorMessage={job.error_message}
          status={job.status}
          userRole={profile.role}
        />
      )}

      {/* Result */}
      {job.result && <JobResultCard result={job.result as JobResult} />}

      {/* Live Logs */}
      <LiveLogs jobId={job.id} initialLogs={logs} />
    </div>
  );
}
