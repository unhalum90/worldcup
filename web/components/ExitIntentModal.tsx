"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/lib/AuthContext';

// Exit intent promo modal. Shows once on desktop exit intent for non-signed-in users.
export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only run on client, skip if already seen or on touch device
    if (typeof window === "undefined") return;
    // Do not show to logged-in members or subscribers
    try {
      if (user) return;
      if (localStorage.getItem("fz_subscribed") === "1") return;
    } catch {}
    if (localStorage.getItem("fz_exit_seen") === "1") return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return; // skip mobile

    const armTimeout = setTimeout(() => setArmed(true), 2500); // wait a bit before enabling

    const handleMouseOut = (e: MouseEvent) => {
      // Only trigger when the mouse leaves near the top
      if (!armed || open) return;
      const y = e.clientY;
      const toElement = (e as any).toElement || (e as any).relatedTarget;
      if (!toElement && y <= 10) {
        setOpen(true);
        localStorage.setItem("fz_exit_seen", "1");
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      clearTimeout(armTimeout);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [armed, open]);

  // Prevent background interaction and hide maps while modal is open
  // Hook must not be conditional; depend on `open` instead
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('modal-open');
    body.classList.add('modal-open');
    return () => {
      root.classList.remove('modal-open');
      body.classList.remove('modal-open');
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Draw Friday Sale</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Lock in your Fan Zone membership before the Draw on Friday, Dec 5. Price increases to $39 on Dec 6. Access trip tools, guides, and member perks at the current rate.
          </p>

          <button
            onClick={() => {
              try {
                localStorage.setItem('fz_exit_seen', '1');
              } catch {}
              setOpen(false);
              const target = process.env.NEXT_PUBLIC_LS_MEMBER_BUY_URL || '/memberships';
              window.location.href = target;
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md w-full"
          >
            Lock in membership
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <div className="mt-3 text-xs text-gray-500 text-center">Sale ends Dec 5 — price rises to $39 on Dec 6.</div>
        </div>
      </div>
    </div>
  );
}
