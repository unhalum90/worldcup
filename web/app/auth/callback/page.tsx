import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function determineUserDestination(userId: string, redirectPath: string | null): Promise<string> {
  try {
    console.log('[AuthCallback Server] Determining destination for user:', userId);
    
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
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Check if user has completed onboarding (has user_profile)
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('user_id, home_airport')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('[AuthCallback Server] Profile check:', { 
      hasProfile: !!profile, 
      hasHomeAirport: !!profile?.home_airport,
      error: profileError 
    });

    // New user - send to onboarding
    if (!profile || !profile.home_airport) {
      console.log('[AuthCallback Server] New user - redirecting to onboarding');
      return "/onboarding";
    }

    // Returning user - send to intended destination or planner
    console.log('[AuthCallback Server] Returning user - redirecting to destination');
    
    // If they had a specific redirect path, use it
    if (redirectPath && redirectPath !== '/' && redirectPath !== '/account') {
      console.log('[AuthCallback Server] Using redirect path:', redirectPath);
      return redirectPath;
    }

    // Otherwise send to planner as default
    console.log('[AuthCallback Server] Using default destination: /planner');
    return "/planner";
  } catch (error) {
    console.error('[AuthCallback Server] Error determining destination:', error);
    // On error, default to onboarding
    return "/onboarding";
  }
}

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string; redirect?: string };
}) {
  console.log('[AuthCallback Server] Processing callback...', searchParams);
  
  const code = searchParams.code;
  const redirectPath = searchParams.redirect || null;

  if (code) {
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
              console.error('[AuthCallback Server] Error setting cookie:', error);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.delete({ name, ...options });
            } catch (error) {
              console.error('[AuthCallback Server] Error removing cookie:', error);
            }
          },
        },
      }
    );

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AuthCallback Server] Error exchanging code:', error);
      redirect(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }

    if (data.session) {
      console.log('[AuthCallback Server] Session established for user:', data.session.user.id);
      
      // Determine where to send the user
      const destination = await determineUserDestination(data.session.user.id, redirectPath);
      console.log('[AuthCallback Server] Redirecting to:', destination);
      
      redirect(destination);
    }
  }

  // No code present, redirect home
  console.log('[AuthCallback Server] No code present, redirecting home');
  redirect('/');
}