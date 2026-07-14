'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { AutomationLog } from '@/types/database';
import type { LogLevel } from '@/types/database';
import { LOG_LEVEL_COLORS, LOG_LEVEL_LABELS } from '@/lib/constants/statuses';
import { formatTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Terminal, ChevronsDown, Search, X } from 'lucide-react';

interface LogsTerminalProps {
  initialLogs: AutomationLog[];
  jobId?: string; // If set, subscribes to realtime for this specific job
}

const LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All levels' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Success' },
];

export function LogsTerminal({ initialLogs, jobId }: LogsTerminalProps) {
  const [logs, setLogs] = useState<AutomationLog[]>(initialLogs);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterText, setFilterText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialLogs.map((l) => l.id)));

  // Optional realtime subscription (for logs page without specific job)
  useEffect(() => {
    if (!jobId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`logs-terminal-${jobId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'automation_logs', filter: `job_id=eq.${jobId}` },
        (payload: any) => {
          const newLog = payload.new as AutomationLog;
          if (!seenIds.current.has(newLog.id)) {
            seenIds.current.add(newLog.id);
            setLogs((prev) => [...prev, newLog]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 60);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel && log.level !== filterLevel) return false;
    if (filterText && !log.message.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-border bg-[#0d0d0d] overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-muted/10">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span>Logs</span>
          <span className="text-xs text-muted-foreground">({filteredLogs.length}/{logs.length})</span>
        </div>

        {/* Level filter */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="text-xs rounded-md border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Text filter */}
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter messages…"
            className="w-full text-xs rounded-md border border-border bg-background pl-6 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
          className={cn(
            'flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 transition-all ml-auto',
            autoScroll ? 'text-emerald-400 bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <ChevronsDown className="w-3 h-3" />
          {autoScroll ? 'Auto-scroll' : 'Scroll to bottom'}
        </button>
      </div>

      {/* Log stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto p-4 font-mono text-xs space-y-0.5"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-muted-foreground/50 italic">
            {logs.length === 0 ? 'No logs yet…' : 'No logs match current filters.'}
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-3 hover:bg-white/5 px-1 -mx-1 rounded py-0.5">
              <span className="text-muted-foreground/40 shrink-0 w-20">{formatTime(log.created_at)}</span>
              <span className={cn('shrink-0 w-12 font-semibold', LOG_LEVEL_COLORS[log.level as LogLevel])}>
                {LOG_LEVEL_LABELS[log.level as LogLevel]}
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
