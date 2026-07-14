'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AutomationLog } from '@/types/database';

/**
 * Subscribe to realtime log inserts for a specific job.
 * Merges incoming rows with the initial server-fetched logs.
 */
export function useLogsRealtime(jobId: string, initialLogs: AutomationLog[]) {
  const [logs, setLogs] = useState<AutomationLog[]>(initialLogs);
  const seenIds = useRef(new Set(initialLogs.map((l) => l.id)));

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`logs-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_logs',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const newLog = payload.new as AutomationLog;
          if (!seenIds.current.has(newLog.id)) {
            seenIds.current.add(newLog.id);
            setLogs((prev) => [...prev, newLog]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  // Sync if initialLogs change (server re-fetch)
  useEffect(() => {
    setLogs(initialLogs);
    seenIds.current = new Set(initialLogs.map((l) => l.id));
  }, [initialLogs]);

  return logs;
}
