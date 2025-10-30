"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Callback] Starting auth callback handler...');
        
        // The createBrowserClient has detectSessionInUrl: true
        // so it automatically handles the PKCE code exchange
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[Callback] Checking for session...');
        // Check if we have a session now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[Callback] Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error: sessionError 
        });
        
        if (!session) {
          console.error('[Callback] No session after callback');
          router.replace('/');
          return;
        }

        console.log('[Callback] Checking user profile...');
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select('user_id, home_airport')
          .eq('user_id', session.user.id)
          .maybeSingle();

        console.log('[Callback] Profile check:', { 
          hasProfile: !!profile, 
          hasHomeAirport: !!profile?.home_airport,
          error: profileError 
        });

        // Determine destination
        if (!profile || !profile.home_airport) {
          console.log('[Callback] Redirecting to onboarding');
          router.replace('/onboarding');
        } else {
          console.log('[Callback] Redirecting to planner');
          router.replace('/planner');
        }
      } catch (error) {
        console.error('[Callback] Auth callback error:', error);
        router.replace('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-lg font-medium text-gray-700">Signing you in...</p>
        <p className="text-sm text-gray-500">Please wait a moment</p>
      </div>
    </main>
  );
}