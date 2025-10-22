'use client';

import { useState } from 'react';
import Link from 'next/link';
import TravelPlannerWizard from '@/components/TravelPlannerWizard';
import ItineraryResults from '@/components/ItineraryResults';
import DidYouKnowCarousel from '@/components/DidYouKnowCarousel';

export default function PlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'overview' | 'flights' | 'lodging' | 'complete'>('overview');
  const [itinerary, setItinerary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Generate trip overview
      setLoadingStep('overview');
      const overviewResponse = await fetch('/api/planner/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!overviewResponse.ok) {
        const errorData = await overviewResponse.json();
        throw new Error(errorData.error || 'Failed to generate trip overview');
      }

      const overviewData = await overviewResponse.json();
      const sessionId = overviewData.session_id;

      // Step 2: Generate flight recommendations
      setLoadingStep('flights');
      const flightsResponse = await fetch('/api/planner/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!flightsResponse.ok) {
        const errorData = await flightsResponse.json();
        throw new Error(errorData.error || 'Failed to generate flight recommendations');
      }

      const flightsData = await flightsResponse.json();

      // Step 3: Generate lodging recommendations
      setLoadingStep('lodging');
      const lodgingResponse = await fetch('/api/planner/lodging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!lodgingResponse.ok) {
        const errorData = await lodgingResponse.json();
        throw new Error(errorData.error || 'Failed to generate lodging recommendations');
      }

      const lodgingData = await lodgingResponse.json();

      // Step 4: Fetch complete session
      setLoadingStep('complete');
      const sessionResponse = await fetch(`/api/planner/session?session_id=${sessionId}`);

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to retrieve complete trip plan');
      }

      const sessionData = await sessionResponse.json();

      // Format data for display
      const completeItinerary = {
        overview: overviewData.overview,
        flights: flightsData.flights,
        lodging: lodgingData.lodging,
        session_id: sessionId,
        trip_context: sessionData.session.trip_context,
      };

      setItinerary(completeItinerary);
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
                  {loadingStep === 'overview' && 'Creating your trip overview...'}
                  {loadingStep === 'flights' && 'Finding the best flight routes...'}
                  {loadingStep === 'lodging' && 'Analyzing lodging options in each city...'}
                  {loadingStep === 'complete' && 'Finalizing your personalized plan...'}
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: loadingStep === 'overview' ? '25%' 
                        : loadingStep === 'flights' ? '50%'
                        : loadingStep === 'lodging' ? '75%'
                        : '100%'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Step {loadingStep === 'overview' ? '1' : loadingStep === 'flights' ? '2' : loadingStep === 'lodging' ? '3' : '4'} of 4
                </p>
              </div>
            </div>

            {/* Did You Know Carousel */}
            <div className="py-6">
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
                While You Wait: World Cup History Quiz
              </h3>
              <DidYouKnowCarousel />
            </div>

            {/* Status messages with step indicators */}
            <div className="max-w-md mx-auto space-y-3 text-center">
              <div className={`flex items-center justify-center space-x-2 ${
                loadingStep === 'overview' ? 'text-blue-600 font-medium' : 
                ['flights', 'lodging', 'complete'].includes(loadingStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                {['flights', 'lodging', 'complete'].includes(loadingStep) ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                )}
                <p className="text-sm">1. Analyzing trip overview and route</p>
              </div>
              
              <div className={`flex items-center justify-center space-x-2 ${
                loadingStep === 'flights' ? 'text-blue-600 font-medium' : 
                ['lodging', 'complete'].includes(loadingStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                {['lodging', 'complete'].includes(loadingStep) ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                ) : loadingStep === 'flights' ? (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
                <p className="text-sm">2. Finding optimal flight routes</p>
              </div>
              
              <div className={`flex items-center justify-center space-x-2 ${
                loadingStep === 'lodging' ? 'text-blue-600 font-medium' : 
                loadingStep === 'complete' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {loadingStep === 'complete' ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                ) : loadingStep === 'lodging' ? (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
                <p className="text-sm">3. Recommending lodging zones with city guides</p>
              </div>
              
              <div className={`flex items-center justify-center space-x-2 ${
                loadingStep === 'complete' ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}>
                {loadingStep === 'complete' ? (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
                <p className="text-sm">4. Finalizing your personalized itinerary</p>
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
