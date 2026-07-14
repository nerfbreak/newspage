import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/database';
import { STATUS_LABELS } from '@/lib/constants/statuses';
import { Loader2 } from 'lucide-react';

const statusStyles: Record<JobStatus, string> = {
  queued: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-muted/60 text-muted-foreground border-border',
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {status === 'running' && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
