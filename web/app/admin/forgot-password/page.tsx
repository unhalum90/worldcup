'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent-green)] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="w-full bg-[color:var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:brightness-110 transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent-green)] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
              placeholder="admin@worldcupfanzone.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[color:var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/admin/login')}
            className="text-sm text-[color:var(--color-primary)] hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
