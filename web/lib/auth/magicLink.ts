import { supabase } from '@/lib/supabaseClient';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

export function buildAuthCallbackUrl(redirectPath?: string) {
  const base = getSiteUrl();
  const callback = new URL('/auth/callback', base);
  if (redirectPath) {
    callback.searchParams.set('redirect', redirectPath);
  }
  return callback.toString();
}

export async function sendMagicLink(email: string, redirectPath?: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(redirectPath),
    },
  });

  if (error) throw error;
}
