'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendMagicLink } from '@/lib/auth/magicLink';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function AuthModal({ isOpen, onClose, redirectTo }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const targetPath = redirectTo || '/onboarding';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendMagicLink(email, targetPath);
      
      // Store email for verification page
      localStorage.setItem('pending_verification_email', email);
      localStorage.setItem('pending_verification_redirect', targetPath);

      // Show success message
      setSuccess('Check your email! We sent you a magic link to sign in.');
      
      // Redirect to verification page after brief delay
      setTimeout(() => {
        onClose();
        router.push('/verify-email');
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to send magic link. Please try again.';
      
      // Handle existing user case gracefully
      if (message.includes('already registered') || message.includes('user_already_exists')) {
        setSuccess('This email is already registered — check your inbox for a Magic Link to sign in.');
        setTimeout(() => {
          onClose();
          router.push('/verify-email');
        }, 2000);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
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
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
            <p className="text-gray-600 text-sm">
              Enter your email and we'll send you a magic link.
              <br />
              <span className="font-medium">No password needed.</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending link…' : 'Send magic link'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Works for new and existing accounts. Check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    </div>
  );
}
