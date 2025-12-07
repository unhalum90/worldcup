"use client";

import React, { useState } from "react";
import Link from "next/link";
import demoData from "@/data/flight_builder_demo.json";

type FlightPlanOption = {
  label: string;
  tagline: string;
  suitability: string;
  keyBenefits: string[];
  flights: Array<{
    route: string;
    airlines: string[];
    duration: string;
    estPrice: string;
    layover?: string;
    bookingTips?: string;
    exampleFlight?: string;
  }>;
  alternateAirports?: string[];
  groundTransport?: string[];
  connectionCity?: string;
  reliabilityNote?: string;
  familyTip?: string;
};

const OPTION_ICONS: Record<string, string> = {
  "Smartest Option": "💡",
  "Budget Option": "💰",
  "Fastest Option": "⚡",
};

const OPTION_COLORS: Record<string, string> = {
  "Smartest Option": "from-blue-500 to-blue-600",
  "Budget Option": "from-green-500 to-green-600",
  "Fastest Option": "from-purple-500 to-purple-600",
};

function FlightOptionCard({ option }: { option: FlightPlanOption }) {
  const [expanded, setExpanded] = useState(false);
  const gradient = OPTION_COLORS[option.label] || "from-gray-500 to-gray-600";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`bg-gradient-to-r ${gradient} p-5 cursor-pointer`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{OPTION_ICONS[option.label] || "✈️"}</span>
            <div>
              <h3 className="text-xl font-bold">{option.label}</h3>
              <p className="text-white/90 text-sm">{option.tagline}</p>
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
        <p className="text-gray-700">{option.suitability}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {option.keyBenefits.map((benefit, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              ✓ {benefit}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Flight Details */}
      {expanded && (
        <div className="p-5 space-y-5 bg-gray-50">
          {/* Flight Legs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>✈️</span> Flight Legs
            </h4>
            {option.flights.map((flight, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{flight.route}</span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {flight.estPrice}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Airlines:</span> {flight.airlines.join(", ")}
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span> {flight.duration}
                  </div>
                  {flight.layover && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Layover:</span> {flight.layover}
                    </div>
                  )}
                  {flight.exampleFlight && (
                    <div className="col-span-2 text-xs text-gray-500 italic">
                      Example: {flight.exampleFlight}
                    </div>
                  )}
                </div>
                {flight.bookingTips && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    💡 {flight.bookingTips}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {option.alternateAirports && option.alternateAirports.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">🛫 Alternate Airports</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.alternateAirports.map((ap, i) => (
                    <li key={i}>• {ap}</li>
                  ))}
                </ul>
              </div>
            )}

            {option.groundTransport && option.groundTransport.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">🚗 Ground Transport</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.groundTransport.map((gt, i) => (
                    <li key={i}>• {gt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="flex flex-wrap gap-3">
            {option.reliabilityNote && (
              <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                ℹ️ {option.reliabilityNote}
              </div>
            )}
            {option.familyTip && (
              <div className="text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
                👨‍👩‍👧‍👦 {option.familyTip}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightBuilderDemoPage() {
  const data = demoData as any;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/trip_builder_demo" className="hover:text-white">Trip Demo</Link>
            <span>/</span>
            <span>Flight Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">✈️ Flight Planner Demo</h1>
          <p className="text-white/90">{data.summary.travelerProfile}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Trip Summary</h2>
              <p className="text-gray-600">{data.summary.note}</p>
            </div>
          </div>
        </div>

        {/* Flight Options */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Flight Options</h2>
          {data.options.map((option: FlightPlanOption, i: number) => (
            <FlightOptionCard key={i} option={option} />
          ))}
        </div>

        {/* Reminders */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span>📝</span> Travel Reminders
          </h3>
          <ul className="space-y-2">
            {data.reminders.map((reminder: string, i: number) => (
              <li key={i} className="text-amber-800 text-sm flex items-start gap-2">
                <span className="text-amber-600">•</span>
                {reminder}
              </li>
            ))}
          </ul>
        </div>

        {/* Ground Transport Notes */}
        {data.sharedGroundNotes && (
          <div className="bg-gray-100 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🚌</span> Ground Transport Notes
            </h3>
            <ul className="space-y-2">
              {data.sharedGroundNotes.map((note: string, i: number) => (
                <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to Plan Your Flights?</h3>
          <p className="text-white/90 mb-6">Get personalized flight recommendations based on your actual trip dates and preferences.</p>
          <Link
            href="/membership/paywall"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition"
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
