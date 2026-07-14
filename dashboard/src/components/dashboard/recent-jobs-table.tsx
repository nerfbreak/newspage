import Link from 'next/link';
import type { JobWithProfile } from '@/types/jobs';
import { StatusBadge } from '@/components/jobs/status-badge';
import { formatRelative } from '@/lib/utils/date';
import { TASK_LABELS } from '@/lib/constants/statuses';
import type { TaskName } from '@/lib/constants/statuses';
import { ArrowRight } from 'lucide-react';

interface RecentJobsTableProps {
  jobs: JobWithProfile[];
}

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No jobs yet. Run your first automation above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left font-medium text-muted-foreground">Task</th>
            <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="pb-3 text-left font-medium text-muted-foreground hidden md:table-cell">When</th>
            <th className="pb-3 text-right font-medium text-muted-foreground" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-muted/10 transition-colors">
              <td className="py-3 pr-4">
                <p className="font-medium">
                  {TASK_LABELS[job.task_name as TaskName] ?? job.task_name}
                </p>
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={job.status} />
              </td>
              <td className="py-3 pr-4 hidden md:table-cell text-muted-foreground">
                {formatRelative(job.created_at)}
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
