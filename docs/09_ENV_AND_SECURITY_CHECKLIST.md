# Environment Variables and Security Checklist

## Next.js / Vercel Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WORKER_SHARED_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Worker Environment Variables
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
WORKER_ID=home-worker-01
WORKER_SHARED_SECRET=
PORTAL_URL=
PORTAL_USERNAME=
PORTAL_PASSWORD=
```

## Security Checklist
- [ ] Service role key never used in browser/client component.
- [ ] Portal credentials only stored in worker environment.
- [ ] `.env` is gitignored.
- [ ] `.env.example` contains placeholders only.
- [ ] RLS enabled for all public tables.
- [ ] Role checks implemented for settings/admin pages.
- [ ] API inputs validated with Zod.
- [ ] Logs scrub sensitive strings.
- [ ] Screenshots/artifacts do not expose secrets.
- [ ] Worker endpoints use shared secret.
- [ ] Cancel/retry endpoints validate user role.
- [ ] Realtime subscriptions only expose allowed data.

## Suggested Secret Scrubbing
Before writing any log, replace values matching:
- password
- token
- cookie
- authorization header
- session id
- portal credential values
