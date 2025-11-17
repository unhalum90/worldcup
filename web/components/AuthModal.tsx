'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MEMBERSHIP_GATE_REDIRECT, sendMagicLink } from '@/lib/auth/magicLink';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function AuthModal({ isOpen, onClose, redirectTo }: AuthModalProps) {
  const router = useRouter();
  const t = useTranslations('auth.modal');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Force new sign-ins through the membership gate to ensure proper gating
  const targetPath = MEMBERSHIP_GATE_REDIRECT;

  // Prevent background interaction and hide maps while modal is open
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('modal-open');
    body.classList.add('modal-open');
    return () => {
      root.classList.remove('modal-open');
      body.classList.remove('modal-open');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[AuthModal] sending magic link', { email, targetPath })
      await sendMagicLink(email, targetPath);
      
      // Store email for verification page
      localStorage.setItem('pending_verification_email', email);
      localStorage.setItem('pending_verification_redirect', targetPath);

      // Show success message
      setSuccess(t('success.primary'));
      console.log('[AuthModal] magic link sent')
      
      // Redirect to verification page after brief delay
      setTimeout(() => {
        onClose();
        router.push('/verify-email');
      }, 1500);
    } catch (err) {
      console.log('[AuthModal] send magic link error', String(err))
      const message =
        err instanceof Error
          ? err.message
          : '';
      
      // Handle existing user case gracefully
      if (message.includes('already registered') || message.includes('user_already_exists')) {
        setSuccess(t('success.existing'));
        setTimeout(() => {
          onClose();
          router.push('/verify-email');
        }, 2000);
      } else {
        setError(t('errors.generic'));
      }
    } finally {
      console.log('[AuthModal] submit finished')
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
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
            <h2 className="text-3xl font-bold text-gray-900">{t('header.title')}</h2>
            <p className="text-gray-600 text-sm">
              {t('header.subtitle.line1')}
              <br />
              <span className="font-medium">{t('header.subtitle.line2')}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.emailLabel')}
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('form.placeholder')}
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
              {loading ? t('actions.sending') : t('actions.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            {t('footer.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
