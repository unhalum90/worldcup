"use client";

import { useEffect, useState } from "react";

export default function SubscribeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => {
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('fz_subscribed') === '1') {
          return; // already subscribed — don't open again
        }
      } catch {}
      setOpen(true);
    };
    const markSubscribed = () => {
      try {
        localStorage.setItem('fz_subscribed', '1');
        localStorage.setItem('fz_exit_seen', '1');
      } catch {}
      setOpen(false);
    };
    window.addEventListener('fz:open-subscribe' as any, openHandler);
    window.addEventListener('fz:mark-subscribed' as any, markSubscribed);
    return () => {
      window.removeEventListener('fz:open-subscribe' as any, openHandler);
      window.removeEventListener('fz:mark-subscribed' as any, markSubscribed);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📬</span>
            <h3 className="text-lg sm:text-xl font-bold">Subscribe to Fan Zone Insider</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">Get weekly World Cup 2026 updates, city guides, and travel tips.</p>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <iframe
              title="Beehiiv Subscribe"
              src="https://wc26fanzone.beehiiv.com/"
              className="w-full h-[520px]"
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => { try { localStorage.setItem('fz_subscribed', '1'); localStorage.setItem('fz_exit_seen','1'); } catch {}; setOpen(false); }}
              className="flex-1 px-4 py-2 rounded-lg bg-[color:var(--color-accent-red)] text-white font-semibold hover:brightness-110 transition-colors shadow"
            >
              I subscribed — continue
            </button>
            <a
              href="/login"
              className="flex-1 px-4 py-2 rounded-lg border text-[color:var(--color-neutral-800)] font-semibold hover:bg-gray-50 text-center"
            >
              Create your site account
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">Loads securely via beehiiv.com. No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}
