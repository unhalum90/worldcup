"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_AUTH_REDIRECT, MEMBERSHIP_GATE_REDIRECT, POST_MEMBERSHIP_ONBOARDING_PATH } from "@/lib/auth/magicLink";

function sanitizeCode(input: string) {
  return input.replace(/[^0-9A-Za-z]/g, "").trim();
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
    return DEFAULT_AUTH_REDIRECT;
  }, [redirect]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pending_verification_email");
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  async function postLoginRedirect() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        router.push(target);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, home_airport, is_member")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile || profile.is_member !== true) {
        router.push(MEMBERSHIP_GATE_REDIRECT);
        return;
      }

      if (!profile.home_airport) {
        router.push(POST_MEMBERSHIP_ONBOARDING_PATH);
        return;
      }
      router.push(target);
    } catch {
      router.push(target);
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

