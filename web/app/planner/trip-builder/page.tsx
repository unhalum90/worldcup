'use client';

import { useState } from 'react';
import Link from 'next/link';
import TravelPlannerWizard from '@/components/TravelPlannerWizard';
import ItineraryResults from '@/components/ItineraryResults';
import DidYouKnowCarousel from '@/components/DidYouKnowCarousel';

export default function PlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">World Cup 2026 Travel Planner</h1>
          <p className="text-gray-600">AI-powered itineraries for the greatest show on earth ⚽</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        {!itinerary && !isLoading && (
          <TravelPlannerWizard onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}

        {isLoading && (
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            {/* Title and Progress */}
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  🌍 Crafting Your Perfect World Cup Journey...
                </h2>
                <p className="text-lg text-gray-600">
                  Our AI is analyzing your preferences with expert local knowledge
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-progress"></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">⏱️ This usually takes 45-60 seconds</p>
              </div>
            </div>

            {/* Did You Know Carousel */}
            <div className="py-6">
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
                While You Wait: World Cup History Quiz
              </h3>
              <DidYouKnowCarousel />
            </div>

            {/* Status messages */}
            <div className="max-w-md mx-auto space-y-3 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm">Loading city-specific travel guides...</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm">Analyzing flight connections and lodging options...</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="text-sm">Calculating match day logistics...</p>
              </div>
            </div>
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
          <ItineraryResults itinerary={itinerary} onEmailCapture={handleEmailCapture} />
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
