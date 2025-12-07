'use client';

export default function FeatureComparison() {
  const features = [
    {
      name: 'Insider logistics info (Hotel zones, etc.)',
      guides: true,
      builder: true,
      builderNote: null,
    },
    {
      name: 'Match-day transport advice',
      guides: true,
      builder: true,
      builderNote: 'Auto-personalized',
    },
    {
      name: 'Match-to-Match route planning',
      guides: false,
      builder: true,
      builderNote: null,
    },
    {
      name: 'Flight/lodging suggestions',
      guides: false,
      builder: true,
      builderNote: null,
    },
    {
      name: "Temporary closure/fan fest updates (June '26)",
      guides: false,
      builder: true,
      builderNote: 'Automated',
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 text-gray-900">
          Which WC2026 Planning Tool is Right For You?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Compare our products and choose the best fit for your World Cup journey.
        </p>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700">
                  Feature
                </th>
                <th className="text-center p-4 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700">
                  <div>City Guides</div>
                  <div className="text-sm font-normal text-gray-500">$3.99/city</div>
                </th>
                <th className="text-center p-4 bg-blue-50 border-b-2 border-blue-200 font-semibold text-blue-800">
                  <div className="flex items-center justify-center gap-2">
                    Personalized Trip Builder
                    <span className="px-2 py-0.5 bg-amber-400 text-gray-900 text-xs rounded-full font-bold">
                      BEST VALUE
                    </span>
                  </div>
                  <div className="text-sm font-normal text-blue-600">$29 Full Access</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="p-4 border-b border-gray-100 text-gray-700">
                    {feature.name}
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center">
                    {feature.guides ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        <span className="text-gray-400 text-lg">—</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center bg-blue-50/50">
                    {feature.builder ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {feature.builderNote && (
                          <span className="text-xs text-blue-600 font-medium">
                            ({feature.builderNote})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        <span className="text-gray-400 text-lg">—</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Price Row */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="font-semibold text-gray-800">City Guides</div>
            <div className="text-2xl font-bold text-gray-700">$3.99 – $9.99</div>
            <div className="text-sm text-gray-500">per city</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50 border-2 border-blue-300">
            <div className="font-semibold text-blue-800">Personalized Trip Builder</div>
            <div className="text-2xl font-bold text-blue-600">$29</div>
            <div className="text-sm text-blue-600">Full Access</div>
          </div>
        </div>
      </div>
    </section>
  );
}
