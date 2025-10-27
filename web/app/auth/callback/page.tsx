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
        // The hash fragment contains the tokens from Supabase
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Also check query params for code-based flow
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (accessToken && refreshToken) {
          // Set the session from the hash params
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setError(sessionError.message);
            return;
          }

          // Successfully authenticated, redirect to onboarding
          router.replace("/onboarding");
          return;
        }

        if (code) {
          // Try exchanging code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError);
            setError(exchangeError.message);
            return;
          }

          router.replace("/onboarding");
          return;
        }

        // Fallback: check if there's already a session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          router.replace("/onboarding");
        } else {
          // No session found, redirect to home
          console.log('No auth data found, redirecting home');
          router.replace("/");
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Something went wrong');
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
            <p className="text-lg font-medium text-gray-700">Verifying your account...</p>
            <p className="text-sm text-gray-500">You'll be redirected shortly</p>
          </>
        )}
      </div>
    </main>
  );
}
