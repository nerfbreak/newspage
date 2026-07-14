'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { LogOut, User, Play } from 'lucide-react';
import type { Profile } from '@/types/database';
import { TriggerModal } from '@/components/jobs/trigger-modal';
import { useState } from 'react';

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter();
  const [triggerOpen, setTriggerOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card shrink-0">
        <div />

        <div className="flex items-center gap-3">
          {/* Quick Run */}
          {['admin', 'operator'].includes(profile.role) && (
            <button
              id="topbar-run-automation"
              onClick={() => setTriggerOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Play className="w-4 h-4" />
              Run Automation
            </button>
          )}

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {profile.full_name ?? 'User'}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {profile.role}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <TriggerModal
        open={triggerOpen}
        onOpenChange={setTriggerOpen}
        onSuccess={(jobId) => {
          toast.success('Job created! Redirecting…');
          router.push(`/jobs/${jobId}`);
        }}
      />
    </>
  );
}
