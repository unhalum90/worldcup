"use client";

import { useEffect, useState } from "react";
import { sendMagicLink } from "@/lib/auth/magicLink";

interface SubscribeUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribeUpdatesModal({ isOpen, onClose }: SubscribeUpdatesModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Prevent background interaction while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('modal-open');
    body.classList.add('modal-open');
    return () => {
      root.classList.remove('modal-open');
      body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send Magic Link - redirect to home after verification (no premium gate)
      await sendMagicLink(email, "/");

      // Store email for verification page
      localStorage.setItem("pending_verification_email", email);
      localStorage.setItem("pending_verification_redirect", "/");

      // Also opt-in to newsletter via Mailerlite
      try {
        await fetch("/api/newsletter-optin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email,
            source: "match-page-subscribe"
          }),
        });
      } catch (e) {
        console.error("Newsletter opt-in failed:", e);
        // Don't block the flow if newsletter fails
      }

      setSuccess(true);
    } catch (e: any) {
      // Handle existing user case gracefully - still success for them
      if (e.message?.includes('already registered') || e.message?.includes('user_already_exists')) {
        localStorage.setItem("pending_verification_email", email);
        localStorage.setItem("pending_verification_redirect", "/");
        setSuccess(true);
      } else {
        setError(e.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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

        {success ? (
          /* Success State */
          <div className="text-center space-y-4 py-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Check your email!
            </h2>
            <p className="text-sm text-gray-600">
              We sent a magic link to <strong>{email}</strong>. 
              Click the link to confirm your subscription and create your free account.
            </p>
            <p className="text-xs text-gray-500">
              Check your spam folder if you don't see it.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Got it
            </button>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="text-center space-y-2">
              <div className="text-4xl">🔔</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Stay Updated
              </h2>
              <p className="text-sm text-gray-600">
                Get notified when we update match pages with new information after the 
                <strong> March 2026 playoffs</strong> and <strong>May 2026 fan fest announcements</strong>.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
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

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? "Sending..." : "Subscribe for Free"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500">
              Free • No spam • Just World Cup 2026 updates
            </p>
          </>
        )}
      </div>
    </div>
  );
}
