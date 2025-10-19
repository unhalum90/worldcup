'use client';

interface ItineraryOption {
  title: string;
  summary: string;
  flights: {
    routing: string;
    estimatedCost: string;
  };
  cities: Array<{
    cityName: string;
    lodgingZones: Array<{
      zoneName: string;
      whyStayHere: string;
      estimatedRate: string;
      transitToStadium: string;
      transitToFanFest: string;
      pros: string[];
      cons: string[];
    }>;
    matchDayLogistics: string;
    insiderTips: string[];
  }>;
}

interface ItineraryResultsProps {
  itinerary: {
    options: ItineraryOption[];
  };
  onEmailCapture?: () => void;
}

export default function ItineraryResults({ itinerary, onEmailCapture }: ItineraryResultsProps) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Your World Cup 2026 Itinerary Options</h1>
        <p className="text-lg text-gray-600">We've created {itinerary.options.length} personalized trip plans for you</p>
      </div>

      {/* Itinerary Options */}
      <div className="space-y-8">
        {itinerary.options.map((option, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            {/* Option Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{option.title}</h2>
              <p className="text-blue-100">{option.summary}</p>
            </div>

            {/* Option Content */}
            <div className="p-6 space-y-6">
              {/* Flights Section */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">✈️</span> Flights
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-700">{option.flights.routing}</p>
                  <p className="text-lg font-semibold text-blue-600">{option.flights.estimatedCost}</p>
                </div>
              </div>

              {/* Cities Section */}
              {option.cities.map((city, cityIndex) => (
                <div key={cityIndex} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🏙️</span> {city.cityName}
                  </h3>

                  {/* Lodging Zones */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Recommended Lodging Areas:</h4>
                    {city.lodgingZones.map((zone, zoneIndex) => (
                      <div key={zoneIndex} className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-lg text-gray-900">{zone.zoneName}</h5>
                            <p className="text-sm text-gray-600 mt-1">{zone.whyStayHere}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600">{zone.estimatedRate}</p>
                            <p className="text-xs text-gray-500">per night</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600"><strong>To Stadium:</strong> {zone.transitToStadium}</p>
                          </div>
                          <div>
                            <p className="text-gray-600"><strong>To Fan Fest:</strong> {zone.transitToFanFest}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-1">✓ Pros:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {zone.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-700 mb-1">⚠ Cons:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {zone.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Match Day Logistics */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎫 Match Day Logistics:</h4>
                    <p className="text-sm text-blue-800">{city.matchDayLogistics}</p>
                  </div>

                  {/* Insider Tips */}
                  {city.insiderTips && city.insiderTips.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">💡 Insider Tips:</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {city.insiderTips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Email Capture CTA */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-3">Love This Plan?</h3>
        <p className="text-green-100 mb-6">Get match alerts, booking reminders, and exclusive World Cup 2026 tips sent to your inbox!</p>
        <button
          onClick={onEmailCapture}
          className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
        >
          Email Me This Itinerary
        </button>
      </div>

      {/* Start Over */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Start Over with New Preferences
        </button>
      </div>
    </div>
  );
}
