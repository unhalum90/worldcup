'use client';

import Image from 'next/image';
import { getCityMapPath } from '@/lib/cityMaps';
import RouteRibbon from './RouteRibbon';

interface FlightLeg {
  from: string;
  to: string;
  airlines: string[];
  duration: string;
  exampleDeparture?: string;
  exampleArrival?: string;
  frequency?: string;
  notes?: string;
  layoverBefore?: string;
  layoverNotes?: string;
}

interface ItineraryOption {
  title: string;
  summary: string;
  flights: {
    legs?: FlightLeg[];
    routing?: string; // Legacy support
    totalCost?: string;
    estimatedCost?: string; // Legacy support
    costBreakdown?: string;
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
  // Helper function to parse cost strings like "$1,200" or "$250-$350"
  const parseCost = (costString: string | undefined, fallback = 0): number => {
    if (!costString) return fallback;

    // Remove dollar signs, commas, and whitespace
    const cleanedString = costString.replace(/[\$,\s]/g, '');

    // Check for a range (e.g., "250-350")
    if (cleanedString.includes('-')) {
      const parts = cleanedString.split('-');
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          return (start + end) / 2; // Return the average of the range
        }
      }
    }

    // Handle a single number
    const singleNumber = parseInt(cleanedString, 10);
    return isNaN(singleNumber) ? fallback : singleNumber;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Your World Cup 2026 Itinerary Options</h1>
        <p className="text-lg text-gray-600">We've created {itinerary.options.length} personalized trip plans for you</p>
      </div>

      {/* Itinerary Options */}
      <div className="space-y-8">
        {itinerary.options.map((option, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl bg-white">
            {/* Option Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-3 !text-white">{option.title}</h2>
              <p className="text-lg !text-white leading-relaxed">{option.summary}</p>
            </div>

            {/* Option Content - Consistent padding: 32px top / 24px bottom */}
            <div className="p-8 space-y-8">{/* Changed from p-6 to p-8 for more breathing room */}
              {/* Route Ribbon - Visual journey flow */}
              <RouteRibbon cities={option.cities.map(city => city.cityName)} />
              
              {/* Flights Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3">✈️</span> Flights
                </h3>
                
                {/* Enhanced flight legs display */}
                {option.flights.legs && option.flights.legs.length > 0 ? (
                  <div className="space-y-4">
                    {option.flights.legs.map((leg, legIndex) => (
                      <div key={legIndex} className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-5">
                        {/* Layover info if exists */}
                        {leg.layoverBefore && (
                          <div className="mb-3 pb-3 border-b border-blue-200">
                            <p className="text-sm font-medium text-blue-700">
                              ⏱️ Layover: {leg.layoverBefore}
                            </p>
                            {leg.layoverNotes && (
                              <p className="text-xs text-blue-600 mt-1">{leg.layoverNotes}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Flight header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-900">{leg.from}</span>
                            <span className="text-blue-500">→</span>
                            <span className="text-lg font-bold text-gray-900">{leg.to}</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                            {leg.duration}
                          </span>
                        </div>
                        
                        {/* Flight details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Airlines</p>
                            <p className="text-gray-900">{leg.airlines.join(', ')}</p>
                          </div>
                          
                          {leg.exampleDeparture && leg.exampleArrival && (
                            <div>
                              <p className="text-gray-600 font-medium">Example Schedule</p>
                              <p className="text-gray-900">
                                Depart {leg.exampleDeparture} → Arrive {leg.exampleArrival}
                              </p>
                            </div>
                          )}
                          
                          {leg.frequency && (
                            <div>
                              <p className="text-gray-600 font-medium">Availability</p>
                              <p className="text-gray-900">{leg.frequency}</p>
                            </div>
                          )}
                          
                          {leg.notes && (
                            <div className="md:col-span-2">
                              <p className="text-gray-600 font-medium">Notes</p>
                              <p className="text-gray-900">{leg.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Total cost */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Total Flight Cost</p>
                          {option.flights.costBreakdown && (
                            <p className="text-xs text-green-600 mt-1">{option.flights.costBreakdown}</p>
                          )}
                        </div>
                        <p className="text-xl font-bold text-green-700">
                          {option.flights.totalCost || option.flights.estimatedCost}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback to legacy format */
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700">{option.flights.routing}</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {option.flights.estimatedCost || option.flights.totalCost}
                    </p>
                  </div>
                )}
              </div>

              {/* Cities Section */}
              {option.cities.map((city, cityIndex) => {
                const mapPath = getCityMapPath(city.cityName);
                
                return (
                  <div key={cityIndex} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">🏙️</span> {city.cityName}
                    </h3>

                    {/* City Map Banner - Desktop Only */}
                    {mapPath && (
                      <div className="hidden md:block relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg mb-6 border-2 border-gray-300">
                        <Image
                          src={mapPath}
                          alt={`${city.cityName} World Cup 2026 Map`}
                          fill
                          className="object-contain bg-white"
                          priority={cityIndex === 0}
                        />
                      </div>
                    )}

                    {/* Lodging Zones */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Recommended Lodging Areas:</h4>
                    {city.lodgingZones.map((zone, zoneIndex) => (
                      <div key={zoneIndex} className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-xl text-gray-900">{zone.zoneName}</h5>
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{zone.whyStayHere}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-blue-800 text-lg">{zone.estimatedRate}</p>
                            <p className="text-xs text-gray-600 font-medium">per night</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-white rounded-lg p-4 border border-gray-200">
                          <div>
                            <p className="text-gray-700"><span className="font-semibold">To Stadium:</span> {zone.transitToStadium}</p>
                          </div>
                          <div>
                            <p className="text-gray-700"><span className="font-semibold">To Fan Fest:</span> {zone.transitToFanFest}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm font-bold text-green-800 mb-2 flex items-center">
                              <span className="mr-2">✓</span> Pros:
                            </p>
                            <ul className="text-sm text-green-900 space-y-1.5">
                              {zone.pros.map((pro, i) => (
                                <li key={i} className="leading-relaxed">• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm font-bold text-orange-800 mb-2 flex items-center">
                              <span className="mr-2">⚠️</span> Cons:
                            </p>
                            <ul className="text-sm text-orange-900 space-y-1.5 pl-1">
                              {zone.cons.map((con, i) => (
                                <li key={i} className="leading-relaxed">• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Match Day Logistics */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
                      <span className="mr-3">🎫</span> Match Day Logistics
                    </h4>
                    <p className="text-sm text-blue-900 leading-relaxed">{city.matchDayLogistics}</p>
                  </div>

                  {/* Insider Tips */}
                  {city.insiderTips && city.insiderTips.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-yellow-900 mb-3 flex items-center text-lg">
                        <span className="mr-3">💡</span> Insider Tips
                      </h4>
                      <ul className="text-sm text-yellow-900 space-y-2">
                        {city.insiderTips.map((tip, i) => (
                          <li key={i} className="leading-relaxed">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )})}

              {/* Cost Summary */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">💰</span> Estimated Trip Budget
                </h3>
                <div className="space-y-3">
                  {/* Flights */}
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">✈️</span>
                      <span className="font-semibold text-gray-700">Flights</span>
                    </div>
                    <span className="font-bold text-blue-800 text-lg">
                      {option.flights.totalCost || option.flights.estimatedCost || 'See breakdown above'}
                    </span>
                  </div>

                  {/* Lodging */}
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🏨</span>
                      <span className="font-semibold text-gray-700">Lodging</span>
                    </div>
                    <span className="font-bold text-blue-800 text-lg">
                      {(() => {
                        // Estimate 2 nights per city, but can be adjusted
                        const totalNights = option.cities.length * 2; 
                        
                        // Calculate the average rate across all recommended lodging zones
                        const avgRate = option.cities.reduce((sum, city) => {
                          // Use the new parseCost function on the first lodging zone's rate
                          const rate = parseCost(city.lodgingZones[0]?.estimatedRate, 200);
                          return sum + rate;
                        }, 0) / (option.cities.length || 1); // Avoid division by zero
                        
                        const totalLodgingCost = Math.round(avgRate * totalNights);
                        return `$${totalLodgingCost.toLocaleString()}`;
                      })()}
                    </span>
                  </div>

                  {/* Ground Transport */}
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🚗</span>
                      <span className="font-semibold text-gray-700">Ground Transport</span>
                    </div>
                    <span className="font-bold text-blue-800 text-lg">
                      ${Math.round(option.cities.length * 150).toLocaleString()}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-blue-400">
                    <span className="text-xl font-bold text-gray-900">Estimated Total</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {(() => {
                        // 1. Calculate Flight Cost
                        const flightCost = parseCost(option.flights.totalCost || option.flights.estimatedCost, 0);

                        // 2. Calculate Lodging Cost
                        const totalNights = option.cities.length * 2; // Estimate 2 nights per city
                        const avgLodgingRate = option.cities.reduce((sum, city) => {
                          // Use parseCost on the first lodging zone's rate, with a fallback
                          const rate = parseCost(city.lodgingZones[0]?.estimatedRate, 200);
                          return sum + rate;
                        }, 0) / (option.cities.length || 1);
                        const lodgingCost = Math.round(avgLodgingRate * totalNights);

                        // 3. Calculate Ground Transport Cost
                        const transportCost = option.cities.length * 150;

                        // 4. Sum them up
                        const totalCost = flightCost + lodgingCost + transportCost;
                        
                        return `$${totalCost.toLocaleString()}`;
                      })()}
                    </span>
                  </div>

                  {/* Note */}
                  <p className="text-xs text-gray-600 mt-4 italic">
                    * Estimates based on {option.cities.length} cities, ~2 nights per city, mid-range accommodations, 
                    and rental car/rideshare/transit. Actual costs vary by booking time, season, and preferences.
                  </p>
                </div>
              </div>
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
