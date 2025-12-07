'use client';

export default function SecondaryCTA() {
  const handleBuildMyTrip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_redirect', '/membership');
      window.dispatchEvent(new CustomEvent('fz:open-auth'));
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 text-white py-16 sm:py-20">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Ready to stop planning and start booking?
        </h2>
        <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
          Join thousands of fans who are already planning their World Cup 2026 adventure.
        </p>

        {/* Side-by-side Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/cityguides"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Buy Premium City Guides
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <button
            onClick={handleBuildMyTrip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Build My Trip
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Pricing reminder */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
          <span>
            City Guides from <span className="text-white font-semibold">$3.99</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            Trip Builder <span className="text-emerald-400 font-medium">Start Free</span> — Full Access <span className="text-white font-semibold">$29</span>
          </span>
        </div>
      </div>
    </section>
  );
}
