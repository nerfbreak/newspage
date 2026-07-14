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

    let channel: ReturnType<typeof supabase.channel>;

    supabase.auth.getSession().then(() => {
      channel = supabase
        .channel(`job-${job.id}-${Math.random()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'automation_jobs',
            filter: `id=eq.${job.id}`,
          },
          (payload) => {
            setJob(payload.new as AutomationJob);
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [job.id]);

  // Sync if initialJob changes (e.g. server re-fetch)
  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  return job;
}
