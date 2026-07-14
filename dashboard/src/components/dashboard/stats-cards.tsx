import type { DashboardStats } from '@/types/jobs';
import { Briefcase, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatRelative } from '@/lib/utils/date';
import { TASK_LABELS } from '@/lib/constants/statuses';
import type { TaskName } from '@/lib/constants/statuses';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Jobs Today',
      value: stats.jobsToday,
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Running',
      value: stats.running,
      icon: Loader2,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      iconClass: stats.running > 0 ? 'animate-spin' : '',
    },
    {
      label: 'Success Today',
      value: stats.success,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Failed Today',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border, iconClass }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-border/80 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={`rounded-lg p-2 border ${bg} ${border}`}>
              <Icon className={`w-4 h-4 ${color} ${iconClass ?? ''}`} />
            </div>
          </div>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      ))}

      {/* Latest run */}
      {stats.latestJob && (
        <div className="col-span-2 lg:col-span-4 rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="rounded-lg p-2 border bg-muted/30 border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Latest Run</p>
            <p className="font-medium truncate">
              {TASK_LABELS[stats.latestJob.task_name as TaskName] ?? stats.latestJob.task_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatRelative(stats.latestJob.created_at)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
