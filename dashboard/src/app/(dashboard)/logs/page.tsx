import type { Metadata } from 'next';
import { getLogs } from '@/server/logs';
import { LogsTerminal } from '@/components/logs/logs-terminal';

export const metadata: Metadata = {
  title: 'Logs',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const logs = await getLogs({
    job_id: params.job_id,
    level: params.level,
    q: params.q,
    from: params.from,
    to: params.to,
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automation log stream — all jobs
        </p>
      </div>

      <LogsTerminal initialLogs={logs} />
    </div>
  );
}
