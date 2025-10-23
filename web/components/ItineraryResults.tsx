'use client';

import React from 'react';
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
  trip?: {
    cityOrder: string[];
    nightsPerCity: Record<string, number>;
    interCityMoves?: Array<{ day?: string; from: string; to: string; mode: string; estDuration?: string }>;
  };
  availableMatches?: Array<{ city: string; date: string; match?: string; stadium?: string }>;
  flights: {
    legs?: FlightLeg[];
    routing?: string; // Legacy support
    totalCost?: string;
    estimatedCost?: string; // Legacy support
    costBreakdown?: string;
    costNote?: string;
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
  tripInput?: {
    originCity?: string;
    groupSize?: number;
    children?: number;
    seniors?: number;
    startDate?: string;
    endDate?: string;
    citiesVisiting?: string[];
  };
  onEmailCapture?: () => void;
}

export default function ItineraryResults({ itinerary, tripInput, onEmailCapture }: ItineraryResultsProps) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  // No budget math or totals shown; display cost notes only per latest spec.

  // Derive trip summary from provided form input (if available)
  const tripDurationDays = (() => {
    if (!tripInput?.startDate || !tripInput?.endDate) return null;
    const start = new Date(tripInput.startDate);
    const end = new Date(tripInput.endDate);
    const ms = end.getTime() - start.getTime();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  })();

  // Helpers to build a simple bottom summary timeline
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const fmtPretty = (date: Date) =>
    date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  const toISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  type TimelineEntry = { start: Date; end: Date; kind: 'arrive' | 'fly' | 'match' | 'explore' | 'return'; city?: string };
  const buildTimeline = (option: ItineraryOption): TimelineEntry[] => {
    if (!tripInput?.startDate || !tripInput?.endDate) return [] as TimelineEntry[];
    const entries: Array<{ date: Date; label: string; city?: string }> = [];
    const start = new Date(tripInput.startDate);
    const end = new Date(tripInput.endDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1);

    // Prepare matches lookup by date+city
    const matchKey = (iso: string, city: string) => `${iso}__${city}`;
    const matches = new Set<string>();
    (option.availableMatches || []).forEach(m => {
      if (m.date && m.city) matches.add(matchKey(m.date, m.city));
    });

    const order = option.trip?.cityOrder && option.trip.cityOrder.length > 0
      ? option.trip.cityOrder
      : option.cities.map(c => c.cityName);
    // Nights map fallback: distribute remaining days - 1 (arrival+depart) across cities
    const nightsMap: Record<string, number> = { ...(option.trip?.nightsPerCity || {}) };
    const totalKnownNights = Object.values(nightsMap).reduce((a, b) => a + b, 0);
    const totalNights = totalDays - 1; // nights = days - 1
    if (totalKnownNights === 0) {
      let remaining = totalNights;
      order.forEach((city, idx) => {
        const remainingCities = order.length - idx;
        const n = idx === order.length - 1 ? remaining : Math.max(1, Math.floor(remaining / remainingCities));
        nightsMap[city] = n;
        remaining -= n;
      });
    }

    // Build per-city entries
    let cursor = new Date(start);
    order.forEach((city, idx) => {
      if (idx === 0) {
        entries.push({ date: new Date(cursor), label: `arrive`, city });
      } else {
        entries.push({ date: new Date(cursor), label: `fly`, city });
      }

      const nights = Math.max(0, nightsMap[city] ?? 0);
      for (let i = 0; i < nights; i++) {
        cursor = addDays(cursor, 1);
        const iso = toISO(cursor);
        if (matches.has(matchKey(iso, city))) {
          entries.push({ date: new Date(cursor), label: 'match', city });
        } else {
          entries.push({ date: new Date(cursor), label: 'explore', city });
        }
      }
    });

    // Ensure final line marks the return flight on end date
    const lastDate = entries.length ? entries[entries.length - 1].date : start;
    if (lastDate.getTime() !== end.getTime()) {
      entries.push({ date: new Date(end), label: 'return' });
    } else {
      // Replace last label with Flight home if it coincides with end date and not already a travel label
      const last = entries[entries.length - 1];
      if (last.label !== 'arrive' && last.label !== 'fly') {
        last.label = 'return';
      }
    }

    // Compress consecutive 'explore' days into ranges
    const compressed: Array<TimelineEntry> = [];
    for (let i = 0; i < entries.length; i++) {
      const curr = entries[i];
      if (curr.label === 'explore') {
        let j = i;
        let endDate = entries[i].date;
        while (j + 1 < entries.length && entries[j + 1].label === 'explore' && entries[j + 1].city === curr.city &&
               (entries[j + 1].date.getTime() - entries[j].date.getTime()) === dayMs) {
          j++;
          endDate = entries[j].date;
        }
        compressed.push({ start: curr.date, end: endDate, kind: 'explore', city: curr.city });
        i = j;
      } else {
        // map label -> kind
        const kind: TimelineEntry['kind'] = curr.label === 'arrive' ? 'arrive' : curr.label === 'fly' ? 'fly' : curr.label === 'match' ? 'match' : curr.label === 'return' ? 'return' : 'explore';
        compressed.push({ start: curr.date, end: curr.date, kind, city: curr.city });
      }
    }

    return compressed;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Your World Cup 2026 Itinerary Options</h1>
        <p className="text-lg text-gray-600">We've created {itinerary.options.length} personalized trip plans for you</p>
      </div>

      {/* Trip input summary (dates, travelers, cities) */}
      {tripInput && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {tripInput.originCity && <span><strong>Origin:</strong> {tripInput.originCity}</span>}
            {tripInput.startDate && tripInput.endDate && (
              <span>
                <strong>Dates:</strong> {tripInput.startDate} → {tripInput.endDate}
                {tripDurationDays ? ` (${tripDurationDays} days)` : ''}
              </span>
            )}
            {(tripInput.groupSize || tripInput.children || tripInput.seniors) && (
              <span>
                <strong>Travelers:</strong> {tripInput.groupSize ?? 0} adults{(tripInput.children ?? 0) > 0 ? `, ${tripInput.children} children` : ''}{(tripInput.seniors ?? 0) > 0 ? `, ${tripInput.seniors} seniors` : ''}
              </span>
            )}
            {tripInput.citiesVisiting && tripInput.citiesVisiting.length > 0 && (
              <span>
                <strong>Cities:</strong> {tripInput.citiesVisiting.join(' → ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itinerary.options.map((option, index) => {
          const flightCostText = option.flights.costNote || option.flights.totalCost || option.flights.estimatedCost || '—';
          return (
            <div
              key={index}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className={`cursor-pointer rounded-xl border-2 shadow-sm transition-all ${expandedIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100 hover:border-blue-300 hover:shadow-lg'}`}
            >
              <div className="p-5 h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{option.summary}</p>
                </div>
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cities</span>
                    <span className="font-semibold text-gray-900">{option.cities.length}</span>
                  </div>
                  {/* Flights note removed on cards per spec; keep details inside expanded view */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedIndex(expandedIndex === index ? null : index); }}
                    className={`w-full mt-3 px-4 py-2 rounded-lg font-semibold transition-colors ${expandedIndex === index ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    aria-expanded={expandedIndex === index}
                    aria-controls={`itinerary-details-${index}`}
                  >
                    {expandedIndex === index ? 'Hide details' : 'View details'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded details for the selected option */}
      {expandedIndex !== null && itinerary.options[expandedIndex] && (
        <div id={`itinerary-details-${expandedIndex}`} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl bg-white">
          {/* Option Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-3 !text-white">{itinerary.options[expandedIndex].title}</h2>
            <p className="text-lg !text-white leading-relaxed">{itinerary.options[expandedIndex].summary}</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Route Ribbon */}
            <RouteRibbon cities={itinerary.options[expandedIndex].cities.map(city => city.cityName)} />

            {/* Flights Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-3">✈️</span> Flights
              </h3>

              {itinerary.options[expandedIndex].flights.legs && itinerary.options[expandedIndex].flights.legs!.length > 0 ? (
                <div className="space-y-4">
                  {itinerary.options[expandedIndex].flights.legs!.map((leg, legIndex) => (
                    <div key={legIndex} className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-5">
                      {leg.layoverBefore && (
                        <div className="mb-3 pb-3 border-b border-blue-200">
                          <p className="text-sm font-medium text-blue-700">⏱️ Layover: {leg.layoverBefore}</p>
                          {leg.layoverNotes && <p className="text-xs text-blue-600 mt-1">{leg.layoverNotes}</p>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-900">{leg.from}</span>
                          <span className="text-blue-500">→</span>
                          <span className="text-lg font-bold text-gray-900">{leg.to}</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">{leg.duration}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Airlines</p>
                          <p className="text-gray-900">{leg.airlines.join(', ')}</p>
                        </div>
                        {leg.exampleDeparture && leg.exampleArrival && (
                          <div>
                            <p className="text-gray-600 font-medium">Example Schedule</p>
                            <p className="text-gray-900">Depart {leg.exampleDeparture} → Arrive {leg.exampleArrival}</p>
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
                  {itinerary.options[expandedIndex].flights.costNote ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium">Pricing Note</p>
                      <p className="text-blue-900 mt-1">{itinerary.options[expandedIndex].flights.costNote}</p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Total Flight Cost</p>
                          {itinerary.options[expandedIndex].flights.costBreakdown && (
                            <p className="text-xs text-green-600 mt-1">{itinerary.options[expandedIndex].flights.costBreakdown}</p>
                          )}
                        </div>
                        <p className="text-xl font-bold text-green-700">
                          {itinerary.options[expandedIndex].flights.totalCost || itinerary.options[expandedIndex].flights.estimatedCost}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-700">{itinerary.options[expandedIndex].flights.routing}</p>
                  {itinerary.options[expandedIndex].flights.costNote ? (
                    <p className="text-sm text-blue-800">{itinerary.options[expandedIndex].flights.costNote}</p>
                  ) : (
                    <p className="text-lg font-semibold text-blue-600">{itinerary.options[expandedIndex].flights.estimatedCost || itinerary.options[expandedIndex].flights.totalCost}</p>
                  )}
                </div>
              )}
            </div>

            {/* Cities Section */}
            {itinerary.options[expandedIndex].cities.map((city, cityIndex) => {
              const mapPath = getCityMapPath(city.cityName);
              return (
                <div key={cityIndex} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🏙️</span> {city.cityName}
                  </h3>
                  {mapPath && (
                    <div className="hidden md:block relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg mb-6 border-2 border-gray-300">
                      <Image src={mapPath} alt={`${city.cityName} World Cup 2026 Map`} fill className="object-contain bg-white" priority={cityIndex === 0} />
                    </div>
                  )}
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
                            <p className="text-sm font-bold text-green-800 mb-2 flex items-center"><span className="mr-2">✓</span> Pros:</p>
                            <ul className="text-sm text-green-900 space-y-1.5">
                              {zone.pros.map((pro, i) => (<li key={i} className="leading-relaxed">• {pro}</li>))}
                            </ul>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm font-bold text-orange-800 mb-2 flex items-center"><span className="mr-2">⚠️</span> Cons:</p>
                            <ul className="text-sm text-orange-900 space-y-1.5 pl-1">
                              {zone.cons.map((con, i) => (<li key={i} className="leading-relaxed">• {con}</li>))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg"><span className="mr-3">🎫</span> Match Day Logistics</h4>
                    <p className="text-sm text-blue-900 leading-relaxed">{city.matchDayLogistics}</p>
                  </div>
                  {city.insiderTips && city.insiderTips.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-yellow-900 mb-3 flex items-center text-lg"><span className="mr-3">💡</span> Insider Tips</h4>
                      <ul className="text-sm text-yellow-900 space-y-2">
                        {city.insiderTips.map((tip, i) => (<li key={i} className="leading-relaxed">• {tip}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Budget summary intentionally removed per spec: show guidance and notes only. */}
            {/* Bottom Itinerary Summary */}
            {tripInput?.startDate && tripInput?.endDate && (
              <div className="pt-4 mt-2 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center"><span className="mr-2">🗓️</span> Your Trip at a Glance</h3>
                <ul className="text-base text-gray-900 space-y-2 leading-relaxed">
                  {buildTimeline(itinerary.options[expandedIndex]).map((seg, i) => {
                    const sameDay = seg.start.getTime() === seg.end.getTime();
                    const dateText = sameDay ? fmtPretty(seg.start) : `${fmtPretty(seg.start)}–${fmtPretty(seg.end)}`;
                    const city = seg.city ? seg.city : '';
                    const emoji = seg.kind === 'arrive' || seg.kind === 'fly' || seg.kind === 'return' ? '✈️' : seg.kind === 'match' ? '⚽' : (city.includes('Bay Area') ? '🏖' : '🏙');
                    const action = seg.kind === 'arrive' ? `Arrive in ${city}` : seg.kind === 'fly' ? `Fly to ${city}` : seg.kind === 'match' ? 'Match Day' : seg.kind === 'return' ? 'Return Flight Home' : `Explore ${city}`;
                    return (
                      <li key={i}><strong>{dateText}</strong> — {emoji} {action}</li>
                    );
                  })}
                </ul>
                <div className="mt-5 bg-purple-50 border border-purple-200 rounded-lg p-4 print:bg-white print:border-gray-300">
                  <p className="text-sm text-purple-900 print:text-gray-900">
                    🌍 <strong>Coming May 2026:</strong> Our Host City Travel Planners will launch with all World Cup events, Fan Fests, and transport guides — making it even easier to explore each city.
                  </p>
                </div>
                <div className="mt-6">
                  <button onClick={() => window.print()} className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-black print:hidden">Print PDF</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email capture section intentionally removed per request */}

      {/* Start Over */}
      <div className="text-center print:hidden">
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Start Over with New Preferences
        </button>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          html, body { background: #fff !important; }
          * { box-shadow: none !important; }
          .shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
          .bg-gradient-to-r, .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-purple-50, .bg-white { background: #fff !important; }
          .border-blue-200, .border-gray-200, .border-gray-300, .border-yellow-300, .border-purple-200 { border-color: #ccc !important; }
          .text-white { color: #000 !important; }
          .ring-2, .ring, .ring-blue-200 { box-shadow: none !important; }
          /* Hide interactive-only UI */
          button, .print\:hidden { display: none !important; }
          /* Ensure comfortable margins */
          @page { margin: 16mm; }
        }
      `}</style>
    </div>
  );
}
