'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/lib/AuthContext';

type PhaseKey = 'tripBuilder' | 'flightPlanner' | 'lodgingPlanner' | 'whileThere';

interface Phase {
  id: number;
  emoji: string;
  key: PhaseKey;
  status: 'live' | 'coming-soon' | 'may-2026';
  href: string;
  color: string;
}

export default function PlannerPage() {
  const t = useTranslations('planner.hub');
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Preview video removed in favor of live demo page (/trip_builder_demo)

  // Show auth modal if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Hard gate: if not authenticated, show a locked screen (middleware will also redirect on initial navigation)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <AuthModal 
          isOpen={true}
          onClose={() => { /* keep modal open on premium pages when unauthenticated */ }}
          redirectTo="/planner"
        />
        <div className="absolute bottom-8 text-center text-sm text-gray-600">
          <p>{t('locked.message')}</p>
        </div>
      </div>
    );
  }

  const phases: Phase[] = useMemo(() => [
    {
      id: 1,
      emoji: '🗺️',
      key: 'tripBuilder',
      status: 'live',
      href: '/planner/trip-builder',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      emoji: '✈️',
      key: 'flightPlanner',
      status: 'live',
      href: '/flight-planner',
      color: 'from-[#0EA5E9] to-[#0369A1]'
    },
    {
      id: 3,
      emoji: '🏨',
      key: 'lodgingPlanner',
      status: 'live',
      href: '/lodging-planner',
      color: 'from-[#F87171] to-[#DC2626]'
    },
    {
      id: 4,
      emoji: '🎉',
      key: 'whileThere',
      status: 'may-2026',
      href: '#',
      color: 'from-orange-500 to-red-600'
    }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        redirectTo="/planner"
      />
  {/* Preview video removed; use the demo page instead */}
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('hero.subtitle')}
          </p>
          <button
            onClick={() => {
              document.getElementById('phases-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={t('hero.primaryCtaAria')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t('hero.primaryCta')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {t('hero.badge')}
          </p>
        </div>
      </section>

      {/* Intro Text */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            {t.rich('intro.body', {
              highlight: (chunks) => <span className="font-semibold text-blue-600">{chunks}</span>
            })}
          </p>
        </div>
      </section>

      {/* How It Works moved into Trip Builder card */}

      {/* Four-Phase Grid */}
      <section id="phases-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            {t('ctaSection.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('ctaSection.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.dispatchEvent(new Event('fz:open-subscribe'))}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[color:var(--color-accent-red)] text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg"
            >
              {t('ctaSection.buttons.subscribe')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/30 transition-all border-2 border-white/50"
            >
              {t('ctaSection.buttons.guides')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const t = useTranslations('planner.hub');
  const phaseT = useTranslations(`planner.hub.phases.${phase.key}`);
  const isLive = phase.status === 'live';
  const isMay2026 = phase.status === 'may-2026';
  const isTripBuilder = phase.key === 'tripBuilder';
  const statusBadgeText = isMay2026 ? t('statuses.may2026Badge') : t('statuses.comingSoonBadge');
  const phaseTitle = phaseT('title');
  const phaseDescription = phaseT('description');
  const features = !isTripBuilder
    ? (phaseT('features', { returnObjects: true }) as string[])
    : undefined;
  const howItWorksSteps = isTripBuilder
    ? (phaseT('howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>)
    : [];
  
  const cardContent = (
    <>
      {/* Status Badge */}
      {!isLive && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            isMay2026 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {statusBadgeText}
          </span>
        </div>
      )}

      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${phase.color} p-8 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 text-9xl opacity-10 transform translate-x-8 -translate-y-4">
          {phase.emoji}
        </div>
        <div className="relative z-10">
          <div className="text-5xl mb-4">{phase.emoji}</div>
          <h3 className="text-2xl font-bold mb-2">{phaseTitle}</h3>
          <p className="text-white/90 text-sm">{phaseDescription}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isTripBuilder ? (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {phaseT('howItWorks.title')}
            </h4>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-sm font-bold text-gray-700 mb-1">{step.title}</div>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={phase.href}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {phaseT('howItWorks.cta.open')}
              </Link>
              <Link
                href="/trip_builder_demo"
                onClick={(e) => { e.stopPropagation(); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors !text-white"
              >
                {phaseT('howItWorks.cta.demo')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Features:
            </h4>
            <ul className="space-y-2 mb-6">
              {phase.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-gray-600 text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
          </>
        )}

        {/* CTA Button for non-Trip Builder cards */}
        {!isTripBuilder && isLive ? (
          <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
            <span>{phaseT('cta')}</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        ) : !isTripBuilder && isMay2026 ? (
          <button className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg cursor-not-allowed">
            {t('statuses.may2026Button')}
          </button>
        ) : !isTripBuilder ? (
          <button className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg cursor-not-allowed">
            {t('statuses.comingSoonButton')}
          </button>
        ) : null}
      </div>
    </>
  );

  const cardClassName = `group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${isLive ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`;

  if (isLive && !isTripBuilder) {
    return (
      <Link href={phase.href} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      {cardContent}
    </div>
  );
}

// removed inline PreviewModal in favor of reusable VideoModal
