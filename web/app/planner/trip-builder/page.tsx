'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';

export default function TripBuilderPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        redirectTo="/planner/trip-builder"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/planner" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Travel Planner
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🗺️</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trip Builder</h1>
              <p className="text-gray-600">Plan your route and match schedule</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* AI Planner Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖✨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Trip Planning
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get personalized World Cup 2026 itineraries powered by AI — matches, cities, and experiences tailored just for you.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FeatureItem 
                icon="🎯"
                title="Team-Based Routes"
                description="Follow your team's journey with AI-suggested travel routes"
              />
              <FeatureItem 
                icon="📍"
                title="Multi-City Planning"
                description="Distance and time estimates between all 16 host cities"
              />
              <FeatureItem 
                icon="⚽"
                title="Match Integration"
                description="See upcoming matches and add them to your itinerary"
              />
              <FeatureItem 
                icon="📄"
                title="Export & Share"
                description="Download your plan as PDF or share with friends"
              />
            </div>

            {/* Status Message */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    Full AI Trip Builder Available Soon
                  </h3>
                  <p className="text-blue-800 mb-4">
                    The complete AI-powered trip builder with interactive map, match scheduler, and itinerary generation is ready on the <code className="bg-blue-100 px-2 py-1 rounded font-mono text-sm">ai-travel-planner</code> branch.
                  </p>
                  <ul className="space-y-2 text-blue-700 text-sm">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Interactive city map with route visualization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>AI chat interface for itinerary customization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Budget tracking and cost optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Accommodation and dining recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/teams"
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
            >
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                Browse Teams
              </h3>
              <p className="text-gray-600 text-sm">
                See all 28 qualified teams and their match schedules
              </p>
            </Link>

            <Link
              href="/guides"
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
            >
              <div className="text-4xl mb-3">🏙️</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                City Guides
              </h3>
              <p className="text-gray-600 text-sm">
                Explore all 16 host cities across USA, Canada, and Mexico
              </p>
            </Link>

            <Link
              href="/forums"
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                Join Forums
              </h3>
              <p className="text-gray-600 text-sm">
                Connect with fans and get local tips from each city
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
