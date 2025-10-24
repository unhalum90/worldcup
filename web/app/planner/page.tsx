'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';
import VideoModal from '@/components/VideoModal';

interface Phase {
  id: number;
  emoji: string;
  title: string;
  description: string;
  status: 'live' | 'coming-soon' | 'may-2026';
  href: string;
  color: string;
  features: string[];
}

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
          <p className="text-gray-600">Loading...</p>
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
          <p>This section is for members. Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  const phases: Phase[] = [
    {
      id: 1,
      emoji: '🗺️',
      title: 'Trip Builder',
      description: 'Map your route and see where your team plays — connect cities, matches, and dates into one simple plan.',
      status: 'live',
      href: '/planner/trip-builder',
      color: 'from-blue-500 to-blue-600',
      features: [
        // Replaced visually by How It Works steps inside the card
        'Pick cities & matches',
        'Get smart routes',
        'Share your itinerary'
      ]
    },
    {
      id: 2,
      emoji: '✈️',
      title: 'Getting There',
      description: 'Find the fastest and most affordable ways to hop between World Cup cities — flight suggestions, routes, and smart timing insights.',
      status: 'coming-soon',
      href: '/planner/flights',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Skyscanner integration',
        'Hub airport suggestions',
        'Flexible fare recommendations',
        'Multi-city route optimization'
      ]
    },
    {
      id: 3,
      emoji: '🏨',
      title: 'Staying There',
      description: 'Hand-picked hotels, hostels, and neighborhoods — all near stadiums and fan celebrations.',
      status: 'coming-soon',
      href: '/planner/lodging',
      color: 'from-green-500 to-green-600',
      features: [
        'Booking.com deep links',
        'Stadium radius filters',
        'Fan Zone recommended areas',
        'Save favorite stays'
      ]
    },
    {
      id: 4,
      emoji: '🎉',
      title: 'While You\'re There',
      description: 'From fan fests to public transport, discover everything you need once you\'ve arrived.',
      status: 'may-2026',
      href: '#',
      color: 'from-orange-500 to-red-600',
      features: [
        'Fan fest locations & schedules',
        'Local transport guides',
        'Safety & cultural tips',
        'Watch party listings'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        redirectTo="/planner"
      />
  <VideoModal
    open={showPreview}
    onClose={() => setShowPreview(false)}
    title="Planner Preview"
    // Place the file at public/videos/travelplanner_preview.mov so it is web-accessible
    src="/videos/travelplanner_preview.mov"
  />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-6">
            <span className="text-6xl mb-4 inline-block">⚽</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Plan Every Step of Your World Cup Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From booking your first flight to finding fan fests on match day — we've got you covered, city by city.
          </p>
          <button
            onClick={() => {
              document.getElementById('phases-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Planning
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Powered by smart AI — so your trip plans itself ✨
          </p>
        </div>
      </section>

      {/* Intro Text */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            The <span className="font-semibold text-blue-600">Fan Zone Travel Planner</span> brings everything together — your matches, flights, stays, and on-the-ground experiences — into one easy place to explore. Whether you're following your team across borders or soaking up one host city's atmosphere, this is your home base for travel planning.
          </p>
        </div>
      </section>

      {/* How It Works moved into Trip Builder card */}

      {/* Four-Phase Grid */}
      <section id="phases-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} onPreview={() => setShowPreview(true)} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Wherever your team takes you — we've got your trip covered
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get updates, new features, and fresh travel insights straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.dispatchEvent(new Event('fz:open-subscribe'))}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[color:var(--color-accent-red)] text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg"
            >
              Subscribe to Fan Zone Insider
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/30 transition-all border-2 border-white/50"
            >
              Browse City Guides
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

function PhaseCard({ phase, onPreview }: { phase: Phase; onPreview?: () => void }) {
  const isLive = phase.status === 'live';
  const isMay2026 = phase.status === 'may-2026';
  const isTripBuilder = phase.title === 'Trip Builder';
  
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
            {isMay2026 ? '📅 May 2026' : '🚧 Coming Soon'}
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
          <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
          <p className="text-white/90 text-sm">{phase.description}</p>
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
              How It Works
            </h4>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm font-bold text-gray-700 mb-1">1. Pick cities & matches</div>
                <p className="text-xs text-gray-600">Choose by team, date, or must-see stadiums.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm font-bold text-gray-700 mb-1">2. Get smart routes</div>
                <p className="text-xs text-gray-600">Best connections with buffers, distances, and transit.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm font-bold text-gray-700 mb-1">3. Share your itinerary</div>
                <p className="text-xs text-gray-600">Export to share with your group — PDF/link soon.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={phase.href}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Open Trip Builder
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onPreview?.(); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Preview the Planner
              </button>
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
            <span>{isTripBuilder ? 'Open Trip Builder' : 'Open'}</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        ) : !isTripBuilder && isMay2026 ? (
          <button className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg cursor-not-allowed">
            Launches May 2026
          </button>
        ) : !isTripBuilder ? (
          <button className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg cursor-not-allowed">
            Coming Soon
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
