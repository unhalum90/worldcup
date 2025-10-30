import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function determineUserDestination(userId: string, redirectPath: string | null): Promise<string> {
  try {
    console.log('[AuthCallback Server] Determining destination for user:', userId);
    
    // If they had a specific redirect path, use it (unless it's /account which causes loops)
    if (redirectPath && redirectPath !== '/' && redirectPath !== '/account') {
      console.log('[AuthCallback Server] Using redirect path:', redirectPath);
      return redirectPath;
    }

    // Try to check profile, but don't fail if it errors
    try {
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

      // If profile exists with home airport, they're a returning user -> planner
      if (profile?.home_airport) {
        console.log('[AuthCallback Server] Returning user with profile - redirecting to planner');
        return "/planner";
      }
    } catch (profileCheckError) {
      console.error('[AuthCallback Server] Profile check failed, defaulting to planner:', profileCheckError);
      // If profile check fails, assume returning user and send to planner
      return "/planner";
    }

    // No profile or no home airport - new user -> onboarding
    console.log('[AuthCallback Server] New user or incomplete profile - redirecting to onboarding');
    return "/onboarding";
  } catch (error) {
    console.error('[AuthCallback Server] Error determining destination:', error);
    // On any error, default to planner (safer for existing users)
    return "/planner";
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
    console.log('[AuthCallback Server] Attempting to exchange code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[AuthCallback Server] Exchange result:', {
      hasData: !!data,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name,
      } : null,
    });

    if (error) {
      console.error('[AuthCallback Server] Error exchanging code:', error);
      const errorMessage = error.message || 'Failed to authenticate. Please try requesting a new sign-in link.';
      redirect(`/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`);
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