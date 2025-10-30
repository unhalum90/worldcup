"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get redirect path from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');

        // Wait a moment for Supabase to auto-detect and handle the session from URL
        // The createBrowserClient has detectSessionInUrl: true, so it handles PKCE automatically
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (!session) {
          console.log('No session found after callback, redirecting home');
          router.replace("/");
          return;
        }

        // We have a session! Determine where to send the user
        const destination = await determineUserDestination(redirectPath);
        router.replace(destination);
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Something went wrong');
      }
    }

    async function determineUserDestination(redirectPath: string | null): Promise<string> {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return "/";
        }

        // Check if user has completed onboarding (has user_profile)
        const { data: profile } = await supabase
          .from('user_profile')
          .select('user_id, home_airport')
          .eq('user_id', user.id)
          .maybeSingle();

        // New user - send to onboarding
        if (!profile || !profile.home_airport) {
          console.log('New user detected - redirecting to onboarding');
          return "/onboarding";
        }

        // Returning user - send to intended destination or planner
        console.log('Returning user detected - redirecting to destination');
        
        // If they had a specific redirect path, use it
        if (redirectPath && redirectPath !== '/') {
          return redirectPath;
        }

        // Otherwise send to planner as default
        return "/planner";
      } catch (error) {
        console.error('Error determining user destination:', error);
        // On error, default to onboarding to be safe
        return "/onboarding";
      }
    }
    
    handleCallback();
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
