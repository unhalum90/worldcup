"use client";

import { useState } from "react";
import { sendMagicLink } from "@/lib/auth/magicLink";

export default function MagicLinkRecovery({ redirect }: { redirect?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const target = redirect && redirect.startsWith("/") ? redirect : "/planner";
      await sendMagicLink(email, target);
      setStatus("✓ Magic link sent. Open it in this browser.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send link";
      setStatus(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        If your email link opened in a different browser/device, resend a new link from here so it works in this browser.
      </p>
      <form onSubmit={handleResend} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Sending…" : "Resend link in this browser"}
        </button>
      </form>
      {status && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${status.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {status}
        </div>
      )}
    </div>
  );
}

