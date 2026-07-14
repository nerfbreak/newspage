import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types/database';

/**
 * Get the current authenticated user's Supabase Auth object.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

/**
 * Get the current user's profile (with role).
 * Redirects to /login if not authenticated.
 */
export async function getCurrentUserProfile(): Promise<Profile> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    // Profile may not exist yet for new users; return a default
    return {
      id: user.id,
      full_name: user.email ?? null,
      role: 'operator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as Profile;
}

/**
 * Require a specific role. Throws a 403-like error if role is insufficient.
 */
export async function requireRole(allowedRoles: Profile['role'][]) {
  const profile = await getCurrentUserProfile();
  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
  return profile;
}
