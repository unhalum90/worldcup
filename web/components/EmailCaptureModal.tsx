"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMagicLink } from "@/lib/auth/magicLink";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailCaptureModal({ isOpen, onClose }: EmailCaptureModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send Magic Link for authentication
      await sendMagicLink(email, "/onboarding");

      // Store email for resend functionality and verification page
      localStorage.setItem("pending_verification_email", email);
      localStorage.setItem("pending_verification_redirect", "/onboarding");

      // Send newsletter opt-in if checked
      if (optIn) {
        try {
          await fetch("/api/newsletter-optin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email,
              source: "onboarding"
            }),
          });
        } catch (e) {
          console.error("Newsletter opt-in failed:", e);
          // Don't block the flow if newsletter fails
        }
      }

      // Redirect to verify page
      router.push("/verify-email");
    } catch (e: any) {
      // Handle existing user case gracefully
      if (e.message?.includes('already registered') || e.message?.includes('user_already_exists')) {
        // Still redirect to verify page for existing users
        localStorage.setItem("pending_verification_email", email);
        localStorage.setItem("pending_verification_redirect", "/onboarding");
        router.push("/verify-email");
      } else {
        setError(e.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">✈️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Let's plan your World Cup 26 trip
          </h2>
          <p className="text-sm text-gray-600">
            Get instant access to your Trip Builder and personalized travel planners for all host cities.
            <br />
            <span className="font-medium">You'll also get updated guides automatically after the Dec 5 Draw.</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
              autoFocus
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Subscribe for travel alerts and city updates
            </span>
          </label>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-bold text-white bg-[color:var(--color-accent-red)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {loading ? "Sending..." : "Continue →"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
