"use client";

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
];

const LANGUAGE_COOKIE = 'wc26-language-selected';
const LOCALE_COOKIE = 'NEXT_LOCALE';
const COOKIE_EXPIRY_DAYS = 365;

export default function LanguageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = useLocale();

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelectedLanguage = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LANGUAGE_COOKIE}=`));

    // Show modal only if they haven't selected a language before
    if (!hasSelectedLanguage) {
      // Small delay to ensure page is loaded
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    // Set cookie to remember user's choice
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    const cookieString = `expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // Set language selected flag
    document.cookie = `${LANGUAGE_COOKIE}=true; ${cookieString}`;
    
    // Set Next.js locale cookie
    document.cookie = `${LOCALE_COOKIE}=${languageCode}; ${cookieString}`;

    // Close modal
    setIsOpen(false);

    // Reload page to apply new locale
    if (languageCode !== currentLocale) {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={() => {}} // Prevent closing by clicking backdrop on first visit
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scaleIn"
          style={{ animation: 'scaleIn 0.3s ease-out' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚽</div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to WC26 Fan Zone
            </h2>
            <p className="text-gray-600">
              Please select your preferred language
            </p>
          </div>

          {/* Language Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                  currentLocale === lang.code
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <span className="text-4xl">{lang.flag}</span>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900">{lang.nativeName}</div>
                  <div className="text-sm text-gray-600">{lang.name}</div>
                </div>
                {currentLocale === lang.code && (
                  <div className="text-blue-600 font-bold">✓</div>
                )}
              </button>
            ))}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center">
            You can change your language anytime from the footer menu
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
