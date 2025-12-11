'use client';

import Link from 'next/link';
import { useState } from 'react';
import SubscribeButton from '@/components/SubscribeButton';

export default function HeroSimple() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // Use the existing subscribe API
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="container py-10 sm:py-14 lg:py-16">
        {/* Headlines */}
        <div className="text-center mb-8 lg:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Your Complete 2026 World Cup
            <span className="block text-amber-300 drop-shadow-lg">Travel Companion</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Personalized travel guides for all 72 group stage matches across 16 North American cities
          </p>
        </div>

        {/* 4 Big Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto mb-10">
          {/* Match Guides */}
          <Link
            href="/matches/view"
            className="group bg-white rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">MATCH GUIDES</h2>
            <p className="text-sm sm:text-base text-gray-600">All 72 group stage matches</p>
          </Link>

          {/* Team Travel */}
          <Link
            href="/teams"
            className="group bg-white rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">TEAM TRAVEL</h2>
            <p className="text-sm sm:text-base text-gray-600">Follow your team's journey</p>
          </Link>

          {/* City Guides */}
          <Link
            href="/guides"
            className="group bg-white rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">CITY GUIDES</h2>
            <p className="text-sm sm:text-base text-gray-600">16 host cities covered</p>
          </Link>

          {/* Trip Planner */}
          <Link
            href="/planner"
            className="group bg-white rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">TRIP PLANNER</h2>
            <p className="text-sm sm:text-base text-gray-600">Build your custom trip</p>
          </Link>
        </div>

        {/* Featured Video Section */}
        <div className="max-w-3xl mx-auto mb-10">
          <p className="text-center text-blue-200 mb-3 font-medium text-sm sm:text-base">
            📺 Latest: Mexico vs South Africa Travel Guide
          </p>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/KFANyzCJTEk?rel=0"
              title="Mexico vs South Africa Travel Guide"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Email Capture */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">🎯 Stay Ahead of the Game</h3>
            <p className="text-blue-100 mb-5 text-center text-base sm:text-lg">Get match alerts, travel deals & exclusive tips delivered to your inbox</p>
            {submitted ? (
              <div className="bg-green-500/30 border border-green-400 rounded-xl px-6 py-5">
                <p className="text-green-100 font-semibold text-lg text-center">✓ You're subscribed! Check your email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-amber-400 text-gray-900 font-bold text-lg rounded-xl hover:bg-amber-300 transition-all hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
