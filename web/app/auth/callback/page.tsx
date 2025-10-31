"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const waitForSession = async () => {
      const maxAttempts = 10;

      for (let attempt = 0; attempt < maxAttempts && isActive; attempt += 1) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          return session;
        }

        // Gradually back off while we wait for Supabase to finish exchanging the code.
        const delay = attempt < 4 ? 200 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return null;
    };

    const handleCallback = async () => {
      try {
        console.log('[Callback] Starting auth callback handler...');

        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get('code');
        const redirectParam = currentUrl.searchParams.get('redirect');
        const redirectPath =
          redirectParam && redirectParam.startsWith('/') ? redirectParam : null;

        if (code) {
          console.log('[Callback] Exchanging code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('[Callback] Code exchange error:', exchangeError);
            throw exchangeError;
          }

          // Once the code has been exchanged, clear it from the URL so refreshes don't repeat the flow.
          currentUrl.searchParams.delete('code');
          window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
        }

        console.log('[Callback] Checking for session...');
        const session = await waitForSession();

        console.log('[Callback] Session check:', {
          hasSession: !!session,
          userId: session?.user?.id,
        });

        if (!session) {
          console.error('[Callback] No session after callback');
          window.location.href = '/';
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
        let destination = redirectPath || '/planner';
        if (!profile || !profile.home_airport) {
          console.log('[Callback] Redirecting to onboarding');
          destination = '/onboarding';
        } else {
          console.log('[Callback] Redirecting to planner');
        }
        
        // Use window.location for hard redirect (router.replace doesn't work reliably here)
        window.location.href = destination;
      } catch (error) {
        console.error('[Callback] Auth callback error:', error);
        window.location.href = '/';
      }
    };

    handleCallback();

    return () => {
      isActive = false;
    };
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
