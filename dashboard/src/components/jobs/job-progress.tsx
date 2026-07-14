'use client';

import { useJobRealtime } from '@/hooks/use-job-realtime';
import type { AutomationJob } from '@/types/database';

interface JobProgressProps {
  initialJob: AutomationJob;
}

export function JobProgress({ initialJob }: JobProgressProps) {
  const job = useJobRealtime(initialJob);

  if (!['running', 'queued'].includes(job.status) && job.progress === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="text-muted-foreground font-mono">{job.progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${job.progress}%` }}
        />
      </div>
      {job.status === 'running' && (
        <p className="text-xs text-muted-foreground animate-pulse">Job is running…</p>
      )}
    </div>
  );
}
