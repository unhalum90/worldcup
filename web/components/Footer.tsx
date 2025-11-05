"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
];

const LOCALE_COOKIE = 'NEXT_LOCALE';
const COOKIE_EXPIRY_DAYS = 365;

export default function Footer() {
  const t = useTranslations();

  const handleLanguageChange = (languageCode: string) => {
    // Set Next.js locale cookie
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    document.cookie = `${LOCALE_COOKIE}=${languageCode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // Reload to apply new locale
    window.location.reload();
  };

  const socialLinks = [
    { name: 'Instagram', icon: '📷', href: 'https://www.instagram.com/fanzonenetwork/', ariaLabel: 'Follow us on Instagram' },
    { name: 'YouTube', icon: '▶️', href: 'https://www.youtube.com/@TheFanZoneNetwork', ariaLabel: 'Subscribe to our YouTube channel' },
    { name: 'X (Twitter)', icon: '𝕏', href: 'https://x.com/thefanzonenet', ariaLabel: 'Follow us on X (Twitter)' },
    { name: 'Reddit', icon: '👽', href: 'https://www.reddit.com/user/thefanzonenetwork/', ariaLabel: 'Visit our Reddit community' },
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 mt-16 border-t border-[color:var(--color-neutral-100)]">
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[color:var(--color-primary)] mb-4">
              <span className="text-3xl">⚽</span>
              <span>WC26 Fan Zone</span>
            </Link>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              Your complete resource for planning the perfect World Cup 2026 experience. Travel guides and AI-powered trip planning.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[color:var(--color-primary)] hover:text-white flex items-center justify-center text-xl transition-all hover:scale-110 shadow-sm"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Features</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/guides" className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors">
                City Guides
              </Link>
              <Link href="/planner" className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors">
                AI Planner
              </Link>
              <a
                href="https://wc26fanzone.beehiiv.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors"
              >
                Newsletter
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>

        {/* Multilingual Flags */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <p className="text-xs text-gray-500 mb-3">Available in multiple languages:</p>
          <div className="flex flex-wrap items-center gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer hover:scale-105"
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} WC26 Fan Zone — All rights reserved
          </p>
          <p className="text-xs text-gray-500">
            Not affiliated with FIFA or the 2026 World Cup organizing committee
          </p>
        </div>
      </div>
    </footer>
  );
}
