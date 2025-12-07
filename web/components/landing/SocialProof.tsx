'use client';

export default function SocialProof() {
  const metrics = [
    { value: '5', label: 'Languages Supported', icon: '🌍' },
    { value: '300+', label: 'Itineraries Built', icon: '📋' },
    { value: '16', label: 'Host Cities Covered', icon: '🏟️' },
    { value: '24hr', label: 'Update Turnaround', icon: '⚡' },
  ];

  return (
    <section className="bg-gray-900 text-white py-16 sm:py-20">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4">
          Trusted Logistics for the World&apos;s Biggest Tournament
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Compiled from official sources, vetted by local fan boards, and updated within 24 hours of major host city announcements.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="text-3xl mb-2">{metric.icon}</div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-400">
                {metric.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="text-center">
          <p className="text-lg text-gray-300 mb-6">
            <span className="font-semibold text-white">Trusted by fans around the world</span> — planning trips from Europe, South America, Asia, Africa, and beyond.
          </p>
          
          {/* Language Flags */}
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-500">Available in:</span>
            <div className="flex gap-3">
              {[
                { flag: '🇺🇸', lang: 'EN' },
                { flag: '🇪🇸', lang: 'ES' },
                { flag: '🇫🇷', lang: 'FR' },
                { flag: '🇧🇷', lang: 'PT' },
                { flag: '🇸🇦', lang: 'AR' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm">
                  <span>{item.flag}</span>
                  <span className="text-gray-300">{item.lang}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
