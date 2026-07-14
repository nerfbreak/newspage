import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing-url.com',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key'
    );
  } catch (e) {
    console.error('Supabase client error:', e);
    return null as any;
  }
}
