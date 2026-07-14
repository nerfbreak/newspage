'use client';

import type { AutomationJob } from '@/types/database';
import { StatusBadge } from './status-badge';
import { useJobRealtime } from '@/hooks/use-job-realtime';
import { TASK_LABELS } from '@/lib/constants/statuses';
import type { TaskName } from '@/lib/constants/statuses';
import { formatDate, formatRelative } from '@/lib/utils/date';
import { formatJobDuration } from '@/lib/utils/duration';
import { User, Clock, Calendar, Hash } from 'lucide-react';

interface JobDetailHeaderProps {
  initialJob: AutomationJob;
  triggeredByName?: string | null;
}

export function JobDetailHeader({ initialJob, triggeredByName }: JobDetailHeaderProps) {
  const job = useJobRealtime(initialJob);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">
            {TASK_LABELS[job.task_name as TaskName] ?? job.task_name}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{job.id}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            Triggered by
          </div>
          <p className="text-sm font-medium">{triggeredByName ?? 'Unknown'}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Created
          </div>
          <p className="text-sm font-medium" suppressHydrationWarning>{formatRelative(job.created_at)}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Duration
          </div>
          <p className="text-sm font-medium">
            {formatJobDuration(job.started_at, job.finished_at)}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="w-3 h-3" />
            Started
          </div>
          <p className="text-sm font-medium" suppressHydrationWarning>{formatDate(job.started_at)}</p>
        </div>
      </div>
    </div>
  );
}
