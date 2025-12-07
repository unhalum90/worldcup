"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_AUTH_REDIRECT, MEMBERSHIP_GATE_REDIRECT, POST_MEMBERSHIP_ONBOARDING_PATH } from "@/lib/auth/magicLink";

function sanitizeCode(input: string) {
  return input.replace(/[^0-9A-Za-z]/g, "").trim();
}

// Extract the final destination from a potentially nested redirect chain
function extractFinalDestination(url: string): string {
  try {
    // If URL contains a redirect param, extract it recursively
    const urlObj = new URL(url, 'http://dummy');
    const redirect = urlObj.searchParams.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      // Decode and recurse to get the innermost redirect
      const decoded = decodeURIComponent(redirect);
      return extractFinalDestination(decoded);
    }
    // Return the path without query params if it's a gating page
    const path = urlObj.pathname;
    if (path === '/membership/paywall' || path === '/onboarding') {
      // These are intermediate pages, try to get redirect or return default
      return redirect ? decodeURIComponent(redirect) : DEFAULT_AUTH_REDIRECT;
    }
    return url;
  } catch {
    return url;
  }
}

export default function EmailOtpVerify({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const target = useMemo(() => {
    if (redirect && redirect.startsWith("/")) return redirect;
    const stored = typeof window !== "undefined" ? localStorage.getItem("pending_verification_redirect") : null;
    if (stored && stored.startsWith("/")) return stored;
    // Default to membership gate so new users are always gated
    return MEMBERSHIP_GATE_REDIRECT;
  }, [redirect]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pending_verification_email");
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  async function postLoginRedirect() {
    console.log('[OtpVerify] postLoginRedirect start');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log('[OtpVerify] session check', { hasSession: Boolean(session), userId });
      
      if (!userId) {
        console.log('[OtpVerify] no userId, redirecting to target:', target);
        router.push(target);
        return;
      }
      
      // Check membership status via API (bypasses RLS)
      let isMember = false;
      try {
        const memberRes = await fetch('/api/membership/check');
        const memberData = await memberRes.json();
        isMember = memberData?.isMember === true;
        console.log('[OtpVerify] membership check via API', { isMember, memberData });
      } catch (e) {
        console.error('[OtpVerify] membership API check failed', e);
      }

      if (!isMember) {
        console.log('[OtpVerify] not a member, redirecting to membership gate');
        router.push(MEMBERSHIP_GATE_REDIRECT);
        return;
      }

      // Check if onboarding is complete (home_airport in user_profile)
      // user_profile should have RLS allowing users to read their own profile
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profile")
        .select("user_id, home_airport")
        .eq("user_id", userId)
        .maybeSingle();
      
      console.log('[OtpVerify] user_profile check', { userProfile, profileError: profileError?.message });

      if (!userProfile?.home_airport) {
        console.log('[OtpVerify] no home_airport, redirecting to onboarding');
        // Pass along the final destination so user ends up there after onboarding
        const finalDest = extractFinalDestination(target);
        const onboardingUrl = `${POST_MEMBERSHIP_ONBOARDING_PATH}?redirect=${encodeURIComponent(finalDest)}`;
        router.push(onboardingUrl);
        return;
      }
      
      // User is a member with completed profile - go to final destination
      const finalDestination = extractFinalDestination(target);
      console.log('[OtpVerify] all checks passed, redirecting to final destination:', finalDestination);
      router.push(finalDestination);
    } catch (err) {
      console.error('[OtpVerify] postLoginRedirect error:', err);
      router.push(extractFinalDestination(target));
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const token = sanitizeCode(code);
      if (!email || !token) {
        setStatus("Enter your email and the 6-digit code");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      } as any);
      if (error) {
        setStatus(error.message || "Invalid code. Please try again.");
        setLoading(false);
        return;
      }
      if (!data?.session) {
        setStatus("Unable to establish a session. Try again.");
        setLoading(false);
        return;
      }
      // Success → route based on profile completeness
      await postLoginRedirect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 font-medium">Have a 6-digit code instead?</p>
      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg tracking-widest text-center font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-400"
        >
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
      </form>
      {status && (
        <div className={`text-sm px-3 py-2 rounded-lg ${status.startsWith("Unable") || status.startsWith("Invalid") || status.toLowerCase().includes("error") ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
