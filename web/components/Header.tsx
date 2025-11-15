"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";
import { useTeamNavbarTheme } from "@/hooks/useTeamNavbarTheme";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, signOut, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  
  // Add team theming
  const { flag } = useTeamNavbarTheme(profile?.favorite_team || undefined);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/teams', label: t('teams') },
    { href: '/groups', label: t('groups') },
    { href: '/guides', label: t('guides') },
    { href: '/planner', label: t('planner') },
  ];

  const isActive = (href: string) => {
    if (href === '/#timeline') return false;
    return pathname === href;
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all ${isScrolled ? 'shadow-lg' : 'shadow-sm'} backdrop-blur-sm`}
        style={{
          backgroundColor: "var(--nav-bg, #FFFFFF)",
          color: "var(--nav-text, #111827)",
          borderBottomColor: "var(--nav-border, var(--color-neutral-100))",
          boxShadow: profile?.favorite_team ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
        }}
      >
        <div className="container flex items-center justify-between py-3 gap-4">
          <Link href="/" className={`flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity ${profile?.favorite_team ? 'nav-with-shadow' : 'nav-no-shadow'}`}
                style={{ 
                  color: profile?.favorite_team ? "var(--nav-text, #111827)" : undefined
                }}>
            {flag && (
              <img 
                src={flag} 
                alt={`${profile?.favorite_team} flag`} 
                className="h-5 w-7 rounded-sm shadow-md object-cover border border-white/20" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
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
                className={`text-sm font-bold transition-colors ${
                  isActive(link.href)
                    ? 'border-b-2 opacity-100'
                    : 'opacity-100 hover:opacity-90'
                } ${profile?.favorite_team ? 'nav-with-shadow' : 'nav-no-shadow'}`}
                style={{
                  color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : undefined,
                  borderBottomColor: isActive(link.href) ? (profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827") : "transparent"
                }}
              >
                {link.label}
              </Link>
            ))}
            
            <LanguageSwitcher />

            {/* Auth area (desktop) */}
            {!loading && !user && (
              <button
                onClick={() => setShowAuth(true)}
                className={`px-3 py-2 rounded-lg border text-sm font-bold opacity-100 hover:opacity-90 transition-all hover:shadow-sm ${profile?.favorite_team ? 'nav-with-shadow' : 'nav-no-shadow text-gray-900 border-gray-900 bg-white/80'}`}
                style={{ 
                  color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : undefined,
                  borderColor: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                  backgroundColor: profile?.favorite_team ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)"
                }}
              >
                {t('signIn')}
              </button>
            )}

            {!loading && user && (
              <div className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-2 group opacity-100 hover:opacity-90 transition-opacity">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${profile?.favorite_team ? 'bg-white/25 border-white/30 nav-with-shadow' : 'bg-gray-200 border-gray-300 nav-no-shadow'}`}
                       style={{ 
                         color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : undefined,
                         backgroundColor: profile?.favorite_team ? "rgba(255,255,255,0.25)" : "rgb(229 231 235)",
                         borderColor: profile?.favorite_team ? "rgba(255,255,255,0.3)" : "rgb(209 213 219)"
                       }}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-bold group-hover:underline ${profile?.favorite_team ? 'nav-with-shadow' : 'nav-no-shadow'}`}
                        style={{ 
                          color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : undefined
                        }}>
                    {user.email?.split('@')[0] || 'Account'}
                  </span>
                </Link>
                <button onClick={signOut} 
                        className={`px-3 py-2 rounded-lg border text-sm font-bold opacity-100 hover:opacity-90 transition-all hover:shadow-sm ${profile?.favorite_team ? 'nav-with-shadow' : 'nav-no-shadow text-gray-900 border-gray-900 bg-white/80'}`}
                        style={{ 
                          color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : undefined,
                          borderColor: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                          backgroundColor: profile?.favorite_team ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)"
                        }}>
                  Sign out
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 hover:opacity-80 rounded-lg transition-opacity ${!profile?.favorite_team ? 'text-gray-900' : ''}`}
            style={{ color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827" }}
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
          <div 
            className="md:hidden border-t"
            style={{
              backgroundColor: "var(--nav-bg, #FFFFFF)",
              borderTopColor: "var(--nav-border, var(--color-neutral-100))"
            }}
          >
            <nav className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors hover:opacity-80 ${
                    isActive(link.href) ? 'opacity-90' : 'opacity-75'
                  } ${!profile?.favorite_team ? 'text-gray-900' : ''}`}
                  style={{ 
                    color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                    backgroundColor: isActive(link.href) ? (profile?.favorite_team ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)") : "transparent"
                  }}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="py-2 px-3">
                <LanguageSwitcher />
              </div>

              {/* Auth area (mobile) */}
              {!loading && !user && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowAuth(true);
                  }}
                  className={`px-4 py-3 rounded-lg border font-semibold hover:opacity-80 text-center transition-opacity ${!profile?.favorite_team ? 'text-gray-900 border-gray-900' : ''}`}
                  style={{ 
                    color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                    borderColor: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827"
                  }}
                >
                  {t('signIn')}
                </button>
              )}

              {!loading && user && (
                <div className="flex items-center justify-between gap-3">
                  <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex-1 flex items-center gap-2 py-2 px-3 rounded-lg hover:opacity-80 transition-opacity">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${!profile?.favorite_team ? 'bg-gray-200 text-gray-900' : 'bg-white/20'}`}
                         style={{ 
                           color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                           backgroundColor: profile?.favorite_team ? "rgba(255,255,255,0.2)" : "rgb(229 231 235)"
                         }}>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className={`text-sm ${!profile?.favorite_team ? 'text-gray-900' : ''}`} 
                          style={{ color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827" }}>
                      {user.email || 'Account'}
                    </span>
                  </Link>
                  <button onClick={async () => { setIsMenuOpen(false); await signOut(); }} 
                          className={`px-4 py-2 rounded-lg border text-sm hover:opacity-80 transition-opacity ${!profile?.favorite_team ? 'text-gray-900 border-gray-900' : ''}`}
                          style={{ 
                            color: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827",
                            borderColor: profile?.favorite_team ? "var(--nav-text, #FFFFFF)" : "#111827"
                          }}>
                    Sign out
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {showAuth && (
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} redirectTo="/account" />
      )}
    </>
  );
}
