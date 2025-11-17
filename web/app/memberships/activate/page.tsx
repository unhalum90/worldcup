"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ActivateMembershipPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function activate(targetEmail?: string) {
    setStatus('loading');
    setMessage('Checking your purchase and activating your membership...');
    try {
      console.log('[Activate] calling /api/membership/activate', { targetEmail: !!targetEmail })
      const res = await fetch('/api/membership/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetEmail ? { email: targetEmail } : {}),
      });
      const data = await res.json();
      console.log('[Activate] response', { status: res.status, data })
      if (!res.ok) {
        setStatus('error');
        setMessage(data?.error === 'not_found' ? 'We could not find a purchase for this email. If you used a different email at checkout, enter it below and try again.' : (data?.details || data?.error || 'Activation failed.'))
        return;
      }
      setStatus('success');
      setMessage('Membership activated! You can now use the Trip Builder.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Network error. Please try again.');
    }
  }

  useEffect(() => {
    // Auto-try activation once when landing from checkout
    const from = search.get('from');
    if (from === 'checkout' && status === 'idle') {
      activate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-extrabold text-gray-900">Activate Membership</h1>
        <p className="mt-2 text-gray-700">If you just completed purchase, click Activate below. If you used a different email at checkout, enter it and try again.</p>

        <div className="mt-6 grid gap-3">
          <button
            onClick={() => activate()}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === 'loading' ? 'Activating...' : 'Activate My Membership'}
          </button>

          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
            <label className="block text-sm font-medium text-gray-700">Checkout Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@used-at-checkout.com"
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => email && activate(email)}
              disabled={!email || status === 'loading'}
              className="mt-3 inline-flex items-center justify-center rounded-full px-4 py-2.5 font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 disabled:opacity-60"
            >
              Try With This Email
            </button>
          </div>

          {message && (
            <div className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message}</div>
          )}

          {status === 'success' && (
            <div className="mt-4 flex gap-2">
              <Link href="/planner/trip-builder" prefetch={false} className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold bg-green-600 text-white hover:bg-green-700">
                Go to Trip Builder
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">
                Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
