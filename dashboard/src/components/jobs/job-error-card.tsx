'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface JobErrorCardProps {
  jobId: string;
  errorMessage: string | null;
  status: string;
  userRole: string;
}

export function JobErrorCard({ jobId, errorMessage, status, userRole }: JobErrorCardProps) {
  const router = useRouter();
  const canRetry = ['admin', 'operator'].includes(userRole) && ['failed', 'cancelled'].includes(status);

  if (!errorMessage && status !== 'failed') return null;

  async function handleRetry() {
    const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error?.message ?? 'Retry failed');
      return;
    }
    toast.success('Retry job created!');
    router.push(`/jobs/${data.job.id}`);
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <h3 className="font-medium text-red-400">Error Details</h3>
      </div>

      {errorMessage ? (
        <pre className="text-sm text-red-300/80 font-mono whitespace-pre-wrap break-words rounded-lg bg-red-500/10 p-3">
          {errorMessage}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">No error message recorded.</p>
      )}

      {canRetry && (
        <button
          id="retry-btn"
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Job
        </button>
      )}
    </div>
  );
}
