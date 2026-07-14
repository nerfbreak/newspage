'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AutomationJob } from '@/types/database';

/**
 * Subscribe to realtime updates for a single job.
 * Returns the latest job state, updated live via Supabase Realtime.
 */
export function useJobRealtime(initialJob: AutomationJob) {
  const [job, setJob] = useState<AutomationJob>(initialJob);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`job-${job.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'automation_jobs',
          filter: `id=eq.${job.id}`,
        },
        (payload: any) => {
          setJob(payload.new as AutomationJob);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job.id]);

  // Sync if initialJob changes (e.g. server re-fetch)
  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  return job;
}
