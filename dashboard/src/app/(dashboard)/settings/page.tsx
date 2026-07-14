import type { Metadata } from 'next';
import { requireRole } from '@/server/auth';
import { createClient } from '@/lib/supabase/server';
import type { WorkerHeartbeat } from '@/types/database';
import { formatRelative, formatDate } from '@/lib/utils/date';
import { WORKER_OFFLINE_THRESHOLD_MINUTES } from '@/lib/constants/statuses';
import { WorkerConfigSection } from '@/components/settings/worker-config';
import { EnvChecklist } from '@/components/settings/env-checklist';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Admin only
  let profile;
  try {
    profile = await requireRole(['admin']);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-20">
        <Shield className="w-10 h-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">Settings are only available to admins.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: heartbeats } = await supabase
    .from('worker_heartbeats')
    .select('*')
    .order('last_seen_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration and health overview</p>
      </div>

      {/* Worker config */}
      <WorkerConfigSection heartbeats={(heartbeats ?? []) as WorkerHeartbeat[]} />

      {/* Env checklist */}
      <EnvChecklist />
    </div>
  );
}
