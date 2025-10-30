import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string; redirect?: string };
}) {
  const code = searchParams.code;
  const redirectPath = searchParams.redirect || null;

  if (!code) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore cookie errors during initial render
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Ignore cookie errors during initial render
          }
        },
      },
    }
  );

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirect(`/auth/auth-code-error?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }

  if (!data.session) {
    redirect('/auth/auth-code-error?error=No%20session%20created');
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('user_profile')
    .select('user_id, home_airport')
    .eq('user_id', data.session.user.id)
    .maybeSingle();

  // Determine destination
  let destination = '/planner';

  if (!profile || !profile.home_airport) {
    // New user or incomplete profile -> onboarding
    destination = '/onboarding';
  } else if (redirectPath && redirectPath !== '/' && redirectPath !== '/account') {
    // Use custom redirect path
    destination = redirectPath;
  }

  redirect(destination);
}