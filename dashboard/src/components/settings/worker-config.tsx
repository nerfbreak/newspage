import type { WorkerHeartbeat } from '@/types/database';
import { WORKER_OFFLINE_THRESHOLD_MINUTES } from '@/lib/constants/statuses';
import { formatRelative, formatDate } from '@/lib/utils/date';
import { Wifi, WifiOff, Server, Clock } from 'lucide-react';

interface WorkerConfigSectionProps {
  heartbeats: WorkerHeartbeat[];
}

export function WorkerConfigSection({ heartbeats }: WorkerConfigSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Worker Status</h2>

      {heartbeats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
          <Server className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">No workers registered</p>
          <p className="text-xs text-muted-foreground">
            Start the worker and it will appear here after sending its first heartbeat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {heartbeats.map((hb) => {
            const diff = Date.now() - new Date(hb.last_seen_at).getTime();
            const isOnline = diff < WORKER_OFFLINE_THRESHOLD_MINUTES * 60 * 1000;

            return (
              <div
                key={hb.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 border ${
                        isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted/30 border-border'
                      }`}
                    >
                      {isOnline ? (
                        <Wifi className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{hb.worker_id}</p>
                      <p className="text-xs text-muted-foreground capitalize">{hb.status}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs rounded-full px-2.5 py-1 font-medium border ${
                      isOnline
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-muted-foreground bg-muted/30 border-border'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Last Seen
                    </p>
                    <p className="font-medium">{formatRelative(hb.last_seen_at)}</p>
                    <p className="text-muted-foreground">{formatDate(hb.last_seen_at)}</p>
                  </div>
                  {Object.keys(hb.metadata).length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Metadata</p>
                      <pre className="text-muted-foreground bg-muted/30 rounded p-2 text-xs overflow-x-auto">
                        {JSON.stringify(hb.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <p className="text-sm font-medium">Worker Heartbeat Endpoint</p>
        <code className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 block">
          POST /api/worker/heartbeat
        </code>
        <p className="text-xs text-muted-foreground">
          Header: <code className="font-mono">x-worker-secret: &lt;WORKER_SHARED_SECRET&gt;</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Offline threshold: {WORKER_OFFLINE_THRESHOLD_MINUTES} minutes
        </p>
      </div>
    </section>
  );
}
