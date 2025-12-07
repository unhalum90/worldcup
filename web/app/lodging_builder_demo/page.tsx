"use client";

import React, { useState } from "react";
import Link from "next/link";
import demoData from "@/data/lodging_builder_demo.json";

const ZONE_COLORS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
];

function ZoneCard({ zone, index, isTop = false }: { zone: any; index: number; isTop?: boolean }) {
  const [expanded, setExpanded] = useState(isTop);
  const gradient = ZONE_COLORS[index % ZONE_COLORS.length];

  return (
    <div className={`bg-white border-2 ${isTop ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-200"} rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all`}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`bg-gradient-to-r ${gradient} p-5 cursor-pointer`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {isTop && (
              <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full">
                ⭐ TOP PICK
              </span>
            )}
            <div>
              <h3 className="text-xl font-bold">{zone.zoneName}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/90 text-sm">{zone.estimatedNightlyRate || zone.estimatedRate}</span>
                {zone.score && (
                  <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full">
                    Score: {zone.score}/100
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            className={`p-2 rounded-full bg-white/20 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-expanded={expanded}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-5 border-b border-gray-100">
        <p className="text-gray-700">{zone.whyTopPick || zone.whyConsider || zone.whyStayHere}</p>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 space-y-5 bg-gray-50">
          {/* Transit Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span>🏟️</span> To Stadium
              </h5>
              <p className="text-sm text-gray-600">{zone.transitToStadium}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span>🎉</span> To Fan Fest
              </h5>
              <p className="text-sm text-gray-600">{zone.transitToFanFest}</p>
            </div>
          </div>

          {/* Hotels */}
          {zone.topHotels && zone.topHotels.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🏨</span> Recommended Hotels
              </h4>
              <div className="grid gap-3">
                {zone.topHotels.map((hotel: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">{hotel.name}</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {hotel.priceRange}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.highlights.map((h: string, j: number) => (
                        <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros/Cons or Tradeoffs */}
          {(zone.pros || zone.tradeOffs) && (
            <div className="grid md:grid-cols-2 gap-4">
              {zone.pros && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h5 className="font-medium text-green-900 mb-2">✓ Pros</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    {zone.pros.map((p: string, i: number) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {zone.cons && (
                <div className="bg-red-50 p-4 rounded-xl">
                  <h5 className="font-medium text-red-900 mb-2">✗ Cons</h5>
                  <ul className="text-sm text-red-800 space-y-1">
                    {zone.cons.map((c: string, i: number) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {zone.tradeOffs && (
                <div className="bg-amber-50 p-4 rounded-xl md:col-span-2">
                  <h5 className="font-medium text-amber-900 mb-2">⚖️ Trade-offs</h5>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {zone.tradeOffs.map((t: string, i: number) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Dining */}
          {zone.diningHighlights && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span>🍽️</span> Dining Highlights
              </h5>
              <p className="text-sm text-gray-600">{zone.diningHighlights.join(" • ")}</p>
            </div>
          )}

          {/* Safety */}
          {zone.safetyNotes && (
            <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
              🛡️ {zone.safetyNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LodgingBuilderDemoPage() {
  const data = demoData as any;
  const plan = data.plan;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/trip_builder_demo" className="hover:text-white">Trip Demo</Link>
            <span>/</span>
            <span>Lodging Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">🏨 Lodging Planner Demo</h1>
          <p className="text-white/90">Where to stay in {plan.city} for the World Cup</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* City Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{plan.city} Overview</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏟️</span>
                  <div>
                    <p className="font-medium text-gray-900">{plan.stadium.name}</p>
                    <p className="text-sm text-gray-600">{plan.stadium.neighborhood}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-medium text-gray-900">Fan Fest</p>
                    <p className="text-sm text-gray-600">{plan.fanFest.location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Your Preferences</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Budget:</span> ${data.preferences.nightlyBudget}/night
                </div>
                <div>
                  <span className="text-gray-500">Nights:</span> {data.preferences.nights}
                </div>
                <div>
                  <span className="text-gray-500">Car rental:</span> {data.preferences.carRental ? "Yes" : "No"}
                </div>
                <div>
                  <span className="text-gray-500">Family:</span> {data.preferences.travelingWithFamily ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Zone */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Recommended Zone</h2>
          <ZoneCard zone={plan.topZone} index={0} isTop={true} />
        </div>

        {/* Alternative Zones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternative Zones</h2>
          <div className="space-y-4">
            {plan.alternativeZones.map((zone: any, i: number) => (
              <ZoneCard key={i} zone={zone} index={i + 1} />
            ))}
          </div>
        </div>

        {/* Match Day Logistics */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>⚽</span> Match Day Logistics
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-amber-900">Stadium</p>
              <p className="text-amber-800">{plan.matchDayLogistics.stadium}</p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Arrival Tip</p>
              <p className="text-amber-800">{plan.matchDayLogistics.arrivalTip}</p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Parking</p>
              <p className="text-amber-800">{plan.matchDayLogistics.parkingInfo}</p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Rideshare</p>
              <p className="text-amber-800">{plan.matchDayLogistics.rideshareZones}</p>
            </div>
          </div>
          {plan.matchDayLogistics.familyTips && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="font-medium text-amber-900 mb-2">👨‍👩‍👧‍👦 Family Tips</p>
              <ul className="text-sm text-amber-800 space-y-1">
                {plan.matchDayLogistics.familyTips.map((tip: string, i: number) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Fan Fest Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span>🎉</span> Fan Fest Info
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="font-medium text-purple-900">Location</p>
              <p className="text-purple-800">{plan.fanFestInfo.location}</p>
            </div>
            <div>
              <p className="font-medium text-purple-900">Hours</p>
              <p className="text-purple-800">{plan.fanFestInfo.hours}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-purple-900">Getting There</p>
              <p className="text-purple-800">{plan.fanFestInfo.gettingThere}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.fanFestInfo.activities.map((activity: string, i: number) => (
              <span key={i} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {activity}
              </span>
            ))}
          </div>
        </div>

        {/* Insider Tips */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span> Insider Tips
          </h3>
          <ul className="space-y-2">
            {plan.insiderTips.map((tip: string, i: number) => (
              <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                <span className="text-gray-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to Find Your Perfect Stay?</h3>
          <p className="text-white/90 mb-6">Get personalized lodging recommendations for any World Cup host city.</p>
          <Link
            href="/membership/paywall"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition"
          >
            Get Full Access
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
