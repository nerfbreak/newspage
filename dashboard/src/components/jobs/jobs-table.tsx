'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RotateCcw, XCircle, Eye } from 'lucide-react';
import type { JobWithProfile } from '@/types/jobs';
import { StatusBadge } from './status-badge';
import { formatDate, formatRelative } from '@/lib/utils/date';
import { formatJobDuration } from '@/lib/utils/duration';
import { TASK_LABELS } from '@/lib/constants/statuses';
import type { TaskName } from '@/lib/constants/statuses';

interface JobsTableProps {
  jobs: JobWithProfile[];
  total: number;
  page: number;
  limit: number;
  userRole: string;
}

export function JobsTable({ jobs, total, page, limit, userRole }: JobsTableProps) {
  const router = useRouter();
  const canAct = ['admin', 'operator'].includes(userRole);
  const totalPages = Math.ceil(total / limit);

  async function handleRetry(jobId: string) {
    const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error?.message ?? 'Retry failed');
      return;
    }
    toast.success('Retry job created!');
    router.push(`/jobs/${data.job.id}`);
  }

  async function handleCancel(jobId: string) {
    const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error?.message ?? 'Cancel failed');
      return;
    }
    toast.success('Job cancelled');
    router.refresh();
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">No jobs found</p>
        <p className="text-sm mt-1">Create a new job using the &quot;Run Automation&quot; button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Task</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Triggered</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Started</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-muted/20 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {TASK_LABELS[job.task_name as TaskName] ?? job.task_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {job.id.slice(0, 8)}…
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1.5">
                    <StatusBadge status={job.status} />
                    {job.status === 'running' && (
                      <div className="w-20">
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.progress}%</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground" suppressHydrationWarning>
                  {formatRelative(job.created_at)}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {formatJobDuration(job.started_at, job.finished_at)}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs" suppressHydrationWarning>
                  {formatDate(job.started_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      title="View detail"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canAct && ['failed', 'cancelled'].includes(job.status) && (
                      <button
                        onClick={() => handleRetry(job.id)}
                        title="Retry"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {canAct && ['queued', 'running'].includes(job.status) && (
                      <button
                        onClick={() => handleCancel(job.id)}
                        title="Cancel"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} jobs
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => router.push(`?page=${page - 1}`)}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => router.push(`?page=${page + 1}`)}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
