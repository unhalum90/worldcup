'use client';

import { useState } from 'react';
import Link from 'next/link';
import ItineraryResults from '@/components/ItineraryResults';
import PlannerLoader from '@/components/PlannerLoader';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import { useProfile } from '@/lib/profile/api';
import ProfileReview from '@/components/trip-planner/ProfileReview';
import TripIntentForm from '@/components/trip-planner/TripIntentForm';
import { useRouter } from 'next/navigation';
import { usePlannerTheme } from '@/hooks/usePlannerTheme';

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { profile, loading: profileLoading, error: profileError } = useProfile({ enabled: !!user });
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [lastForm, setLastForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'review' | 'trip'>('review');
  
  // Apply trip builder theme
  usePlannerTheme('trip');
  
  const themeBackground = { background: 'linear-gradient(135deg, color-mix(in srgb, var(--planner-primary) 12%, #ffffff) 0%, color-mix(in srgb, var(--planner-secondary) 10%, #ffffff) 100%)' };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/travel-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }

  const data = await response.json();
  setLastForm(formData);
  setItinerary(data.itinerary);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCapture = () => {
    // TODO: Implement email capture modal
    alert('Email capture coming soon! For now, screenshot your itinerary.');
  };

  // Loading state while validating auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={themeBackground}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Hard gate for premium page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={themeBackground}>
        <AuthModal isOpen={true} onClose={() => {}} redirectTo="/planner/trip-builder" />
        <div className="absolute bottom-8 text-center text-sm text-gray-600">
          <p>This section is for members. Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={themeBackground}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">World Cup 2026 Travel Planner</h1>
          <p className="text-gray-600">AI-powered itineraries for the greatest show on earth ⚽</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        {profileError && (
          <div className="max-w-3xl mx-auto px-6 mb-6">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              We couldn’t load your saved travel profile. Please refresh to retry or reopen onboarding to capture it again.
            </div>
          </div>
        )}
        {!itinerary && !isLoading && !profileLoading && !profile && (
          <div className="max-w-3xl mx-auto px-6 py-12 text-center space-y-3">
            <p className="text-lg font-semibold text-gray-900">Let’s capture your travel profile first</p>
            <p className="text-sm text-gray-600">
              We need your onboarding details before building itineraries. Head to onboarding to fill it out, then come back here.
            </p>
            <button
              onClick={() => router.push('/onboarding?redirect=/planner/trip-builder')}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Complete onboarding
            </button>
          </div>
        )}

        {!itinerary && !isLoading && profileLoading && (
          <div className="max-w-3xl mx-auto px-6 py-12 text-center text-sm text-gray-600">
            Loading your travel profile…
          </div>
        )}

        {!itinerary && !isLoading && profile && mode === 'review' && (
          <div className="max-w-4xl mx-auto px-6">
            <ProfileReview
              profile={profile}
              onConfirm={() => setMode('trip')}
              onEdit={() => router.push('/account/profile?redirect=/planner/trip-builder')}
            />
          </div>
        )}

        {!itinerary && !isLoading && profile && mode === 'trip' && (
          <div className="max-w-4xl mx-auto px-6">
            <TripIntentForm profile={profile} onSubmit={handleFormSubmit} isLoading={isLoading} onBack={() => setMode('review')} />
          </div>
        )}

        {isLoading && (
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  🌍 Crafting Your Perfect World Cup Journey...
                </h2>
                <p className="text-lg text-gray-600">
                  Our AI is analyzing your preferences with expert local knowledge
                </p>
              </div>

              <p className="text-sm text-gray-500">⏱️ This usually takes 45-60 seconds</p>
            </div>

            <PlannerLoader
              plannerType="trip"
              duration={60000}
              trip={{
                optionIndex: 0,
                option: {
                  title: 'World Cup 2026 Trip',
                  summary: 'Analyzing your itinerary inputs...',
                  cities: (lastForm?.citiesVisiting || []).map((city: string) => ({
                    cityName: city,
                    lodgingZones: [],
                    matchDayLogistics: '',
                    insiderTips: [],
                  })),
                  flights: { estimatedCost: 'TBD' },
                  trip: {
                    cityOrder: lastForm?.citiesVisiting || [],
                    nightsPerCity: {},
                  },
                },
                tripInput: lastForm,
                savedAt: Date.now(),
              }}
            />
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {itinerary && !isLoading && (
          <ItineraryResults itinerary={itinerary} tripInput={lastForm} onEmailCapture={handleEmailCapture} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          <p>Planning your World Cup 2026 adventure? We've got you covered.</p>
          <p className="mt-2">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">← Back to Home</Link>
            {' | '}
            <Link href="/guides" className="text-blue-600 hover:text-blue-700 font-medium">City Guides</Link>
            {' | '}
            <Link href="/forums" className="text-blue-600 hover:text-blue-700 font-medium">Fan Forums</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
