'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        redirectTo="/planner"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">World Cup 2026 Travel Planner</h1>
          <p className="text-gray-600">AI-powered itineraries for the greatest show on earth ⚽</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🤖⚽🗺️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Travel Planner
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Get personalized World Cup 2026 itineraries powered by AI
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg text-blue-900 mb-3">Coming Soon:</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>AI-powered itinerary generation based on your preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Match schedules integrated with accommodation recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Budget optimization and cost breakdowns</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Local experiences and dining suggestions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Transportation options between host cities</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-500 mt-8">
              Full AI Travel Planner will be available in the next update.
              <br />
              <span className="text-sm">Merge the <code className="bg-gray-100 px-2 py-1 rounded">ai-travel-planner</code> branch for complete functionality.</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
