import { CheckCircle2, AlertCircle } from 'lucide-react';

const ENV_VARS = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    required: true,
    isPublic: true,
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous (public) key',
    required: true,
    isPublic: true,
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Service role key — server only, never exposed to browser',
    required: true,
    isPublic: false,
  },
  {
    key: 'WORKER_SHARED_SECRET',
    description: 'Shared secret for worker API authentication',
    required: true,
    isPublic: false,
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    description: 'Public app URL (e.g. https://yourdomain.vercel.app)',
    required: false,
    isPublic: true,
  },
];

export function EnvChecklist() {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Environment Variable Checklist</h2>
      <p className="text-sm text-muted-foreground">
        Verify these are configured in your Vercel project settings or{' '}
        <code className="font-mono text-xs bg-muted rounded px-1">.env.local</code> file.
      </p>

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {ENV_VARS.map((v) => {
          const isSet = !!process.env[v.key];
          return (
            <div key={v.key} className="flex items-center gap-4 px-5 py-3.5 bg-card hover:bg-muted/20 transition-colors">
              <div>
                {isSet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium">{v.key}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {v.isPublic ? (
                  <span className="text-xs rounded-full px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    public
                  </span>
                ) : (
                  <span className="text-xs rounded-full px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400">
                    secret
                  </span>
                )}
                {!v.required && (
                  <span className="text-xs text-muted-foreground">optional</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
        <p className="text-sm font-medium text-amber-400">Security Reminder</p>
        <ul className="text-xs text-amber-400/70 space-y-1 list-disc list-inside">
          <li>Service role key must NEVER be exposed to the browser</li>
          <li>Worker credentials (portal username/password) live only in the worker environment</li>
          <li>Never log secrets, tokens, or session cookies</li>
        </ul>
      </div>
    </section>
  );
}
