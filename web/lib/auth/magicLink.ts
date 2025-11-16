import { supabase } from '@/lib/supabaseClient';

export const POST_MEMBERSHIP_ONBOARDING_PATH = '/onboarding?from=membership&redirect=/planner/trip-builder';
export const MEMBERSHIP_GATE_REDIRECT = `/membership/paywall?from=auth&redirect=${encodeURIComponent(POST_MEMBERSHIP_ONBOARDING_PATH)}`;
export const DEFAULT_AUTH_REDIRECT = '/planner/trip-builder';

function getSiteUrl() {
  // Prefer the actual runtime origin to avoid www/non-www mismatches
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
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

export async function sendMagicLink(email: string, redirectPath: string = DEFAULT_AUTH_REDIRECT) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(redirectPath),
    },
  });

  if (error) throw error;
}
