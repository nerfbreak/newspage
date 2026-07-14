import type { JobResult } from '@/types/database';
import { CheckCircle2, Package } from 'lucide-react';

interface JobResultCardProps {
  result: JobResult | null;
}

export function JobResultCard({ result }: JobResultCardProps) {
  if (!result) return null;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <h3 className="font-medium text-emerald-400">Result Summary</h3>
      </div>

      {result.summary && (
        <p className="text-sm text-foreground">{result.summary}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {result.total_records !== undefined && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-xl font-bold">{result.total_records}</p>
          </div>
        )}
        {result.success_count !== undefined && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 space-y-1">
            <p className="text-xs text-emerald-400/70">Success</p>
            <p className="text-xl font-bold text-emerald-400">{result.success_count}</p>
          </div>
        )}
        {result.failed_count !== undefined && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 space-y-1">
            <p className="text-xs text-red-400/70">Failed</p>
            <p className="text-xl font-bold text-red-400">{result.failed_count}</p>
          </div>
        )}
        {result.duration_seconds !== undefined && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">{result.duration_seconds}s</p>
          </div>
        )}
      </div>

      {result.artifacts && result.artifacts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="w-3 h-3" />
            Artifacts
          </div>
          <ul className="space-y-1">
            {result.artifacts.map((a, i) => (
              <li key={i} className="text-sm font-mono text-muted-foreground">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw JSON (collapsible) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none">
          Raw JSON
        </summary>
        <pre className="mt-2 rounded-lg bg-muted/50 p-3 overflow-x-auto text-muted-foreground">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
}
