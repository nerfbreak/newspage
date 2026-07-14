import type { Metadata } from 'next';
import { getDashboardStats, getRecentJobs } from '@/server/jobs';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentJobsTable } from '@/components/dashboard/recent-jobs-table';
import { WorkerStatus } from '@/components/dashboard/worker-status';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, recentJobs] = await Promise.all([
    getDashboardStats(),
    getRecentJobs(10),
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your automation jobs and worker health
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Jobs</h2>
            <a href="/jobs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </a>
          </div>
          <RecentJobsTable jobs={recentJobs} />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Worker status */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-sm">Worker Health</h2>
            <Suspense
              fallback={
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking worker…
                </div>
              }
            >
              <WorkerStatus />
            </Suspense>
          </div>

          {/* Quick tip */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-2">
            <h3 className="text-sm font-semibold">Quick Start</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click <strong className="text-foreground">Run Automation</strong> in the top bar to start a new job. The worker will pick it up automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
