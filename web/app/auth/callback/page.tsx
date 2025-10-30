"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        console.log('[AuthCallback] Starting callback handler...');
        
        // Get redirect path from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        console.log('[AuthCallback] Redirect path:', redirectPath);

        // Wait for Supabase to auto-detect and handle the session from URL
        // The createBrowserClient has detectSessionInUrl: true, so it handles PKCE automatically
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mounted) return;

        // Now check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[AuthCallback] Session check:', { hasSession: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('[AuthCallback] Error getting session:', sessionError);
          if (mounted) {
            setError(sessionError.message);
          }
          return;
        }

        if (!session) {
          console.log('[AuthCallback] No session found, redirecting home');
          if (mounted) {
            router.replace("/");
          }
          return;
        }

        // We have a session! Determine where to send the user
        console.log('[AuthCallback] Session found, determining destination...');
        const destination = await determineUserDestination(redirectPath);
        console.log('[AuthCallback] Redirecting to:', destination);
        
        if (mounted) {
          router.replace(destination);
        }
      } catch (err: any) {
        console.error('[AuthCallback] Callback error:', err);
        if (mounted) {
          setError(err.message || 'Something went wrong');
        }
      }
    }

    async function determineUserDestination(redirectPath: string | null): Promise<string> {
      try {
        console.log('[AuthCallback] Determining destination...');
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('[AuthCallback] User check:', { hasUser: !!user, error: userError });
        
        if (!user) {
          console.log('[AuthCallback] No user found, returning home');
          return "/";
        }

        console.log('[AuthCallback] Checking user profile for user:', user.id);

        // Check if user has completed onboarding (has user_profile)
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select('user_id, home_airport')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('[AuthCallback] Profile check:', { 
          hasProfile: !!profile, 
          hasHomeAirport: !!profile?.home_airport,
          error: profileError 
        });

        // New user - send to onboarding
        if (!profile || !profile.home_airport) {
          console.log('[AuthCallback] New user detected - will redirect to onboarding');
          return "/onboarding";
        }

        // Returning user - send to intended destination or planner
        console.log('[AuthCallback] Returning user detected - will redirect to destination');
        
        // If they had a specific redirect path, use it
        if (redirectPath && redirectPath !== '/') {
          console.log('[AuthCallback] Using redirect path:', redirectPath);
          return redirectPath;
        }

        // Otherwise send to planner as default
        console.log('[AuthCallback] Using default destination: /planner');
        return "/planner";
      } catch (error) {
        console.error('[AuthCallback] Error determining user destination:', error);
        // On error, default to onboarding to be safe
        return "/onboarding";
      }
    }
    
    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 text-4xl">⚠️</div>
            <p className="text-lg font-medium text-gray-700">Authentication Error</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-700">Signing you in...</p>
            <p className="text-sm text-gray-500">Please wait a moment</p>
          </>
        )}
      </div>
    </main>
  );
}
