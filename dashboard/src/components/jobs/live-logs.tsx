'use client';

import { useEffect, useRef, useState } from 'react';
import { useLogsRealtime } from '@/hooks/use-logs-realtime';
import type { AutomationLog } from '@/types/database';
import { LOG_LEVEL_COLORS, LOG_LEVEL_LABELS } from '@/lib/constants/statuses';
import { formatTime } from '@/lib/utils/date';
import { Terminal, ChevronsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveLogsProps {
  jobId: string;
  initialLogs: AutomationLog[];
}

export function LiveLogs({ jobId, initialLogs }: LiveLogsProps) {
  const logs = useLogsRealtime(jobId, initialLogs);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  function handleScroll() {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(atBottom);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span>Live Logs</span>
          <span className="text-xs text-muted-foreground">({logs.length} lines)</span>
        </div>
        <button
          onClick={() => {
            setAutoScroll(true);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={cn(
            'flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-all',
            autoScroll
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <ChevronsDown className="w-3 h-3" />
          {autoScroll ? 'Auto-scroll on' : 'Scroll to bottom'}
        </button>
      </div>

      {/* Log stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-0.5 scrollbar-thin"
      >
        {logs.length === 0 ? (
          <p className="text-muted-foreground/50 italic">Waiting for logs…</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 hover:bg-white/5 px-1 -mx-1 rounded py-0.5">
              <span className="text-muted-foreground/40 shrink-0 w-20">
                {formatTime(log.created_at)}
              </span>
              <span className={cn('shrink-0 w-12 font-semibold', LOG_LEVEL_COLORS[log.level])}>
                {LOG_LEVEL_LABELS[log.level]}
              </span>
              <span className="text-[#d4d4d4] break-words flex-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
