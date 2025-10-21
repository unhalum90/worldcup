"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/teams', label: 'Teams' },
    { href: '/guides', label: 'Guides' },
    { href: '/forums', label: 'Forums' },
    { href: '/planner', label: 'AI Planner' },
  ];

  const isActive = (href: string) => {
    if (href === '/#timeline') return false;
    return pathname === href;
  };

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white border-b border-[color:var(--color-neutral-100)] transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container flex items-center justify-between py-3 gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[color:var(--color-primary)] hover:opacity-80 transition-opacity">
            <span className="text-2xl">⚽</span>
            <span className="hidden sm:inline">WC26 Fan Zone</span>
            <span className="sm:hidden">WC26</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[color:var(--color-primary)] ${
                  isActive(link.href)
                    ? 'text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)]'
                    : 'text-[color:var(--color-neutral-800)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <a
              href="https://wc26fanzone.beehiiv.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline underline-offset-4 text-[color:var(--color-neutral-800)]"
            >
              Newsletter
            </a>
            
            <LanguageSwitcher />
            
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-[color:var(--color-accent-red)] text-white font-semibold hover:brightness-110 transition-all text-sm shadow-md"
            >
              Join Waitlist
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[color:var(--color-neutral-800)] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[color:var(--color-neutral-100)] bg-white">
            <nav className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-[color:var(--color-primary)]'
                      : 'text-[color:var(--color-neutral-800)] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <a
                href="https://wc26fanzone.beehiiv.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium py-2 px-3 rounded-lg text-[color:var(--color-neutral-800)] hover:bg-gray-50"
              >
                Newsletter
              </a>
              
              <div className="py-2 px-3">
                <LanguageSwitcher />
              </div>
              
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-lg bg-[color:var(--color-accent-red)] text-white font-semibold hover:brightness-110 transition-all text-center shadow-md"
              >
                Join Waitlist
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Sticky CTA Button on Scroll */}
      {isScrolled && (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[color:var(--color-accent-red)] text-white font-bold hover:brightness-110 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-2 animate-bounce-subtle"
          >
            Join Waitlist
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}
