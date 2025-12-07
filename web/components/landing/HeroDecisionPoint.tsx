'use client';

export default function HeroDecisionPoint() {
  const handleBuildMyTrip = () => {
    // Dispatch event to open the global auth modal, then redirect to membership
    if (typeof window !== 'undefined') {
      // Store redirect destination for after auth
      sessionStorage.setItem('auth_redirect', '/membership');
      window.dispatchEvent(new CustomEvent('fz:open-auth'));
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-500 to-blue-700 text-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)]" />

      <div className="container relative py-16 sm:py-20 lg:py-24">
        {/* Primary Headlines */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 leading-tight text-white">
            Choose How You Want to Plan Your
            <span className="block text-amber-300">
              World Cup 2026 Trip
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
            Everything fans need: insider city guides, personalized itineraries, and real-time June/July transport updates.
          </p>
        </div>

        {/* The Two Pills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Left Pill: City Guides */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Just Need Inside Info for Each Host City?
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Buy our premium city guides—written by fans, for fans. Skip the tourist traps and avoid game-day logistics headaches.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Best hotel zones for quick match-day transit',
                'Fan fest locations, safety, and local etiquette',
                'Where supporters actually go pre- and post-match',
                'Stadium logistics you won\'t find on Google Maps',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <a
                href="/cityguides"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold !text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Buy Premium City Guides
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="text-center text-sm text-gray-500">
                From <span className="font-semibold text-gray-900">$3.99</span> per city
              </p>
            </div>
          </div>

          {/* Right Pill: Trip Builder */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-gray-800 ring-2 ring-amber-400">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 rounded-full text-xs font-bold text-gray-900 uppercase tracking-wide">
              Most Popular
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Need a Custom, Self-Updating Itinerary?
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              The Personalized Trip Builder creates your full, optimized itinerary in a minute—and <strong className="text-gray-900">automatically updates</strong> your plan with crucial <strong className="text-gray-900">June/July</strong> logistics.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Personalized route (matches → cities → flights → hotels)',
                'Optimized to avoid nightmare routes (LA → KC → Miami)',
                'Guaranteed to keep you near supporters and best transit',
                'Auto-updates with confirmed transit, fan fests & road closures',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <button
                onClick={handleBuildMyTrip}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold !text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Build My Trip
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <p className="text-center text-sm text-gray-500">
                Full Access: <span className="font-semibold text-gray-900">$29</span>
              </p>
              <a
                href="#how-it-works"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Watch demo first →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
