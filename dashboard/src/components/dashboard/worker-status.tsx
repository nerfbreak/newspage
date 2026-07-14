import { createClient } from '@/lib/supabase/server';
import type { WorkerHeartbeat } from '@/types/database';
import { WORKER_OFFLINE_THRESHOLD_MINUTES } from '@/lib/constants/statuses';
import { formatRelative } from '@/lib/utils/date';
import { Wifi, WifiOff, Server } from 'lucide-react';

async function getLatestHeartbeat(): Promise<WorkerHeartbeat | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('worker_heartbeats')
    .select('*')
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as WorkerHeartbeat | null;
}

export async function WorkerStatus() {
  const heartbeat = await getLatestHeartbeat();

  let isOnline = false;
  if (heartbeat) {
    const diff = Date.now() - new Date(heartbeat.last_seen_at).getTime();
    isOnline = diff < WORKER_OFFLINE_THRESHOLD_MINUTES * 60 * 1000;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
      <div
        className={`rounded-lg p-2.5 border ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-muted/30 border-border'
        }`}
      >
        {isOnline ? (
          <Wifi className="w-5 h-5 text-emerald-400" />
        ) : (
          <WifiOff className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-sm font-medium">
            Worker: {heartbeat?.worker_id ?? 'None registered'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isOnline
            ? `Online · Last seen ${formatRelative(heartbeat?.last_seen_at)}`
            : heartbeat
            ? `Offline · Last seen ${formatRelative(heartbeat.last_seen_at)}`
            : 'No heartbeat received yet'}
        </p>
      </div>

      <div
        className={`h-2.5 w-2.5 rounded-full ${
          isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/40'
        }`}
      />
    </div>
  );
}
