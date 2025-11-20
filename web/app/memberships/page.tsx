"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/AuthContext'

// Simple pricing page using Tailwind to mimic “cards with features and CTAs”.
// Copies wording from memberships.md and wires CTAs to env-based or known links.

// Always route through server endpoints to prefill + lock email
const MEMBER_CHECKOUT = '/api/checkout/member'
const BUNDLE4_CHECKOUT = '/api/checkout/bundle4'
const FREE_DALLAS_PDF = 'https://fanzonenetwork.lemonsqueezy.com/buy/fac0321c-ed0b-4e68-89d1-a01fde5b4166'

export default function MembershipsPage() {
  const t = useTranslations('pricing');
  const { user } = useAuth();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [fromParam, setFromParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFromParam(params.get('from'));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsMember(false);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/api/check-membership');
        if (!res.ok) {
          if (!ignore) setIsMember(false);
          return;
        }
        const data = await res.json();
        if (!ignore) setIsMember(!!data.isMember);
      } catch {
        if (!ignore) setIsMember(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Pass through any query params (e.g., ?code=DISCOUNT or ?inspect=1) to checkout endpoints
  const search = typeof window !== 'undefined' ? window.location.search : ''

  // Membership-focused hero variant when coming from planner/auth flows
  const showMembershipHero = fromParam === 'auth' || fromParam === 'planner';
  const MEMBER_ONLY_CHECKOUT_HREF = `${MEMBER_CHECKOUT}${search}`;

  if (showMembershipHero) {
    const alreadyMember = !!user && isMember === true;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full bg-slate-900/80 border border-slate-700 rounded-3xl px-8 py-10 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Unlock Your Ultimate World Cup 2026 Experience
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Become a member to get instant access to our AI-powered travel planning tools for all 16 host cities.
            </p>
          </div>

          <div className="border border-slate-700 rounded-2xl p-6 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="text-sm uppercase tracking-wide text-slate-400 mb-1">Fan Zone+ Membership</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold text-slate-50">$29</span>
                <span className="text-slate-400 text-sm">one-time payment</span>
              </div>
              <ul className="text-sm text-slate-200 space-y-1.5">
                <li>✓ AI-Powered Trip Builder</li>
                <li>✓ Flight Planner & Price Tracker</li>
                <li>✓ Lodging & Accommodation Assistant</li>
                <li>✓ Personalized multi-city itineraries</li>
              </ul>
            </div>
            <div className="w-full sm:w-auto flex flex-col gap-2">
              {alreadyMember ? (
                <>
                  <div className="text-sm text-emerald-300 font-medium text-center sm:text-left">
                    You&apos;re already a Fan Zone+ member.
                  </div>
                  <Link
                    href="/planner/trip-builder"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold transition-colors"
                  >
                    Open Trip Builder
                  </Link>
                </>
              ) : (
                <a
                  href={MEMBER_ONLY_CHECKOUT_HREF}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-900 font-semibold transition-colors"
                >
                  Get Full Access Now for $29
                </a>
              )}
              <p className="text-xs text-slate-400 text-center sm:text-left">
                One payment covers your entire 2026 planning. No recurring subscription.
              </p>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500 text-center sm:text-left">
            Looking for city PDFs only?{' '}
            <Link href="/guides" className="underline underline-offset-2">
              Browse city guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <header className="py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-gray-700 mt-2">{t('subtitle')}</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Four-up grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {/* Free */}
          <PlanCard
            title={t('cards.free.title')}
            price="$0"
            cadence={t('cards.free.cadence')}
            highlight={false}
            cta={{ label: t('cards.free.cta'), href: '/guides', variant: 'secondary' }}
            features={t.raw('cards.free.features')}
          />

          {/* Match Prep Pass / PDFs */}
          <PlanCard
            title={t('cards.matchPrep.title')}
            price="$3.99"
            cadence={t('cards.matchPrep.cadence')}
            badge={t('cards.matchPrep.badge')}
            highlight={false}
            cta={{ label: t('cards.matchPrep.cta'), href: '/guides', variant: 'secondary' }}
            extraCTA={{ label: t('cards.matchPrep.extraCTA'), href: FREE_DALLAS_PDF }}
            features={t.raw('cards.matchPrep.features')}
          />

          {/* 4‑City Bundle (Most Popular) */}
          <PlanCard
            title={t('cards.bundle4.title')}
            price="$9.99"
            cadence={t('cards.bundle4.cadence')}
            subPriceNote={t('cards.bundle4.subPriceNote')}
            badge={t('cards.bundle4.badge')}
            highlight={false}
            cta={{ label: t('cards.bundle4.cta'), href: `${BUNDLE4_CHECKOUT}${search}`, variant: 'secondary' }}
            features={t.raw('cards.bundle4.features')}
          />

          <PlanCard
            title={t('cards.membership.title')}
            price="$29"
            cadence={t('cards.membership.cadence')}
            subPriceNote={t('cards.membership.subPriceNote')}
            badge={t('cards.membership.badge')}
            highlight
            cta={{ label: t('cards.membership.cta'), href: `${MEMBER_CHECKOUT}${search}`, variant: 'primary' }}
            secondaryCTA={{ label: t('cards.membership.secondaryCTA'), href: '/login?redirect=/planner/trip-builder' }}
            features={t.raw('cards.membership.features')}
          />
        </div>

        {/* Team / Enterprise stub, optional */}
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-3 text-sm text-gray-700 border border-gray-200">
            {t('footer.contactPrefix')} <Link className="underline font-semibold" href="/contact">{t('footer.contactLink')}</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

type PlanCardProps = {
  title: string
  price: string
  cadence: string
  subPriceNote?: string
  features: string[]
  highlight?: boolean
  badge?: string
  cta: { label: string; href: string; variant?: 'primary' | 'secondary' }
  extraCTA?: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
}

function PlanCard({ title, price, cadence, subPriceNote, features, highlight, badge, cta, extraCTA, secondaryCTA }: PlanCardProps) {
  const featureList = Array.isArray(features) ? features : [];
  return (
    <div className={`relative rounded-2xl border ${highlight ? 'border-blue-500/40 bg-white shadow-xl' : 'border-gray-200 bg-white'} p-6 flex flex-col`}> 
      {badge && (
        <div className={`absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
          {badge}
        </div>
      )}

      <div className="mb-3">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="mt-3 flex items-end gap-1">
          <div className="text-3xl font-extrabold text-gray-900">{price}</div>
          <div className="text-gray-500 mb-1">{cadence}</div>
        </div>
        {subPriceNote && <div className="text-xs text-gray-500 mt-1">{subPriceNote}</div>}
      </div>

      <ul className="text-sm text-gray-700 space-y-2 flex-1">
        {featureList.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2">
        <a
          href={cta.href}
          target={cta.href.startsWith('http') ? '_blank' : undefined}
          rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center justify-center rounded-full px-4 py-3 font-semibold ${cta.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'}`}
        >
          {cta.label}
        </a>
        {extraCTA && (
          <a
            href={extraCTA.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
          >
            {extraCTA.label}
          </a>
        )}
        {secondaryCTA && (
          <Link
            href={secondaryCTA.href}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
          >
            {secondaryCTA.label}
          </Link>
        )}
      </div>
    </div>
  )
}
