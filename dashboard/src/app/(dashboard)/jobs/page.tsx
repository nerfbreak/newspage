import type { Metadata } from 'next';
import { getJobs } from '@/server/jobs';
import { getCurrentUserProfile } from '@/server/auth';
import { JobsTable } from '@/components/jobs/jobs-table';
import type { JobFilters } from '@/types/jobs';

export const metadata: Metadata = {
  title: 'Jobs',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = await getCurrentUserProfile();

  const filters: JobFilters = {
    status: params.status,
    task_name: params.task_name,
    from: params.from,
    to: params.to,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
  };

  const { jobs, total, page, limit } = await getJobs(filters);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} job{total !== 1 ? 's' : ''} total
        </p>
      </div>

      <JobsTable
        jobs={jobs}
        total={total}
        page={page}
        limit={limit}
        userRole={profile.role}
      />
    </div>
  );
}
