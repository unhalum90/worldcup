"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ItineraryOption, StoredSelection } from '@/types/trip';
import { usePlannerTheme } from '@/hooks/usePlannerTheme';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/profile/api';
import PlannerLoader from '@/components/PlannerLoader';

const STORAGE_KEY = 'fz_selected_trip_option';

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

type FlightPlanResponse = {
  generatedAt: string;
  summary: {
    travelerProfile: string;
    note: string;
  };
  options: FlightPlanOption[];
  reminders: string[];
  sharedGroundNotes?: string[];
};

const OPTION_ICONS: Record<string, string> = {
  'Smartest Option': '💡',
  'Budget Option': '💰',
  'Fastest Option': '⚡',
};

interface FlightOptionPillProps {
  option: FlightPlanOption;
  index: number;
}

function FlightOptionPill({ option, index }: FlightOptionPillProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-blue-100 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
      {/* Pill Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-blue-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{OPTION_ICONS[option.label] || '✈️'}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-900">{option.label}</h4>
            <p className="text-sm text-gray-600">{option.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            {option.flights[0]?.estPrice?.split(' ')[0] || 'See details'}
          </span>
          <button
            className={`p-2 rounded-full transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-expanded={expanded}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          <div>
            <p className="text-gray-700 mb-3">{option.suitability}</p>
            {option.connectionCity && (
              <p className="text-sm text-gray-600">Typical connection: {option.connectionCity}</p>
            )}
          </div>

          {/* Flight Details */}
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>✈️</span> Flight Details
            </h5>
            {option.flights.map((flight, flightIdx) => (
              <div key={flightIdx} className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold text-gray-900">{flight.route}</h6>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    {flight.duration}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Airlines</p>
                    <p className="text-gray-900">{flight.airlines.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Estimated Price</p>
                    <p className="text-gray-900 font-semibold text-blue-700">{flight.estPrice}</p>
                  </div>
                  {flight.exampleFlight && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 font-medium">Example Flight</p>
                      <p className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{flight.exampleFlight}</p>
                    </div>
                  )}
                  {flight.layover && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 font-medium">Layover</p>
                      <p className="text-gray-900">{flight.layover}</p>
                    </div>
                  )}
                  {flight.bookingTips && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 font-medium">Booking Tips</p>
                      <p className="text-gray-900">{flight.bookingTips}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          {option.keyBenefits && option.keyBenefits.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Why this works</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {option.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid gap-4 md:grid-cols-2">
            {option.reliabilityNote && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h6 className="font-semibold text-green-800 text-sm">Reliability</h6>
                <p className="text-sm text-green-700 mt-1">{option.reliabilityNote}</p>
              </div>
            )}
            {option.familyTip && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h6 className="font-semibold text-purple-800 text-sm">Family Tip</h6>
                <p className="text-sm text-purple-700 mt-1">{option.familyTip}</p>
              </div>
            )}
          </div>

          {/* Alternate Airports & Ground Transport */}
          <div className="grid gap-4 md:grid-cols-2">
            {option.alternateAirports && option.alternateAirports.length > 0 && (
              <div>
                <h6 className="font-semibold text-gray-900 text-sm mb-2">Alternate Airports</h6>
                <ul className="text-sm text-gray-700 space-y-1">
                  {option.alternateAirports.map((alt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {option.groundTransport && option.groundTransport.length > 0 && (
              <div>
                <h6 className="font-semibold text-gray-900 text-sm mb-2">Ground Transport</h6>
                <ul className="text-sm text-gray-700 space-y-1">
                  {option.groundTransport.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Export this option (coming soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightPlannerPage() {
  // Apply flight planner theme
  usePlannerTheme('flight');

  const { user } = useAuth();
  const { profile } = useProfile({ enabled: !!user });

  const [selection, setSelection] = useState<StoredSelection | null>(null);
  const [loadingSelection, setLoadingSelection] = useState(true);
  const [adjustments, setAdjustments] = useState({
    cabin: 'economy',
    travelers: 1,
    allowOvernight: true,
    maxStops: '1',
  });
  const [plan, setPlan] = useState<FlightPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredSelection = JSON.parse(raw);
        setSelection(parsed);
        if (parsed.tripInput?.groupSize) {
          setAdjustments((prev) => ({ ...prev, travelers: parsed.tripInput?.groupSize || prev.travelers }));
        }
      }
    } catch (err) {
      console.error('Failed to read stored itinerary', err);
    } finally {
      setLoadingSelection(false);
    }
  }, []);

  // Update travelers count based on profile when available
  useEffect(() => {
    if (profile && !selection) {
      // Calculate total travelers from profile
      const adults = profile.group_size || 2;
      const children = (profile.children_0_5 || 0) + (profile.children_6_18 || 0) + (profile.children || 0);
      const seniors = profile.seniors || 0;
      const totalTravelers = adults + children + seniors;
      
      if (totalTravelers > 0) {
        setAdjustments((prev) => ({ ...prev, travelers: totalTravelers }));
      }
    }
  }, [profile, selection]);

  const cityList = useMemo(() => {
    if (!selection) return [];
    if (selection.option.trip?.cityOrder?.length) return selection.option.trip.cityOrder;
    return selection.option.cities.map((c) => c.cityName);
  }, [selection]);

  const handleGenerate = async () => {
    if (!selection) return;
    setLoadingPlan(true);
    setError(null);
    try {
      const res = await fetch('/api/flight-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection,
          adjustments,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate flight plan');
      setPlan(json.plan || json);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate flight plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  if (loadingSelection) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading your Trip Builder selection…</p>
      </main>
    );
  }

  if (!selection) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Choose an itinerary first</h1>
          <p className="text-gray-600">
            The Flight Planner works best with a saved itinerary. Head back to the Trip Builder, expand the plan you prefer, and tap
            “Continue to Flight Planner.”
          </p>
          <Link
            href="/planner/trip-builder"
            prefetch={false}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Return to Trip Builder
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">✓ Trip Built</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-semibold">Step 2: Flights</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-semibold">Step 3: Lodging</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">World Cup 2026 Flight Planner</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We imported your Trip Builder itinerary. Review the legs, tweak any flight preferences, and we'll craft Smartest, Budget, and Fastest
            options with real-time guidance.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Selected itinerary</p>
              <h2 className="text-2xl font-bold text-gray-900">{selection.option.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{selection.option.summary}</p>
            </div>
            <button
              onClick={() => window.open('/planner/trip-builder', '_blank')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
            >
              Switch itinerary
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Route</p>
              <p>{cityList.join(' → ')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Dates</p>
              <p>
                {selection.tripInput?.startDate || '—'} → {selection.tripInput?.endDate || '—'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Travelers</p>
              <p>
                {selection.tripInput?.groupSize ?? 1} adults
                {selection.tripInput?.children ? `, ${selection.tripInput.children} children` : ''}
                {selection.tripInput?.seniors ? `, ${selection.tripInput.seniors} seniors` : ''}
              </p>
            </div>
          </div>
          {selection.option.flights?.legs && selection.option.flights.legs.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-gray-900 mb-2">Trip Builder flight outline</p>
              <ul className="divide-y rounded-xl border border-gray-100 bg-gray-50">
                {selection.option.flights.legs.map((leg, idx) => (
                  <li key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                    <span className="font-semibold text-gray-900">{leg.from} → {leg.to}</span>
                    <span className="text-gray-600">{leg.duration} · {leg.airlines.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow border border-blue-100 p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Flight preferences</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Cabin class
              <select
                value={adjustments.cabin}
                onChange={(e) => setAdjustments((prev) => ({ ...prev, cabin: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium Economy</option>
                <option value="business">Business</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Travelers
              <input
                type="number"
                min={1}
                value={adjustments.travelers}
                onChange={(e) => setAdjustments((prev) => ({ ...prev, travelers: Number(e.target.value) || 1 }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Max connections
              <select
                value={adjustments.maxStops}
                onChange={(e) => setAdjustments((prev) => ({ ...prev, maxStops: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="0">Nonstop only</option>
                <option value="1">Up to 1 stop</option>
                <option value="2">Up to 2 stops</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={adjustments.allowOvernight}
                onChange={(e) => setAdjustments((prev) => ({ ...prev, allowOvernight: e.target.checked }))}
                className="rounded border-gray-300"
              />
              I’m open to overnight flights
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
            <button
              onClick={handleGenerate}
              disabled={loadingPlan}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loadingPlan ? 'Planning flights…' : 'Generate flight plan'}
            </button>
            <p className="text-xs text-gray-500">We’ll compare Smartest, Budget, and Fastest options based on your itinerary.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>

        {/* Loading State */}
        {loadingPlan && selection && (
          <section>
            <PlannerLoader 
              plannerType="flight" 
              trip={selection}
              duration={45000}
            />
          </section>
        )}

        {/* Always show option to continue */}
        {!plan && !loadingPlan && (
          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to skip flight planning for now?</h3>
            <p className="text-sm text-gray-600 mb-4">
              You can continue to lodging planning and come back to flights later.
            </p>
            <Link 
              href="/lodging-planner"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Lodging Planner
            </Link>
          </section>
        )}

        {plan && (
          <section className="space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-lg p-6">
              <p className="uppercase text-xs tracking-wide">Flight plan ready</p>
              <h3 className="text-2xl font-bold mt-1">Smart, Budget & Fastest matches</h3>
              <p className="text-sm mt-2">{plan.summary.travelerProfile}</p>
              <p className="text-sm mt-1">{plan.summary.note}</p>
              <p className="text-xs mt-1">Generated: {new Date(plan.generatedAt).toLocaleString()}</p>
            </div>

            {/* Flight Option Pills */}
            <div className="space-y-4">
              {plan.options.map((option, idx) => (
                <FlightOptionPill key={idx} option={option} index={idx} />
              ))}
            </div>
            {(plan.sharedGroundNotes && plan.sharedGroundNotes.length > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-blue-900 mb-2">Match-day ground tips</p>
                <ul className="text-sm text-blue-900 space-y-1">
                  {plan.sharedGroundNotes.map((tip, i) => <li key={i}>• {tip}</li>)}
                </ul>
              </div>
            )}
            {plan.reminders && plan.reminders.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Travel prep reminders</p>
                <ul className="text-sm text-indigo-900 space-y-1">
                  {plan.reminders.map((tip, i) => <li key={i}>• {tip}</li>)}
                </ul>
              </div>
            )}

            {/* Navigation to Next Steps */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">Ready for the next step?</h3>
              <p className="text-blue-100 mb-6">
                You've got your flight options! Now let's find the perfect accommodations near your matches and explore dining options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/lodging-planner"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Step 3: Find Lodging
                </Link>
                <Link 
                  href="/planner/trip-builder"
                  prefetch={false}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back to Trip Builder
                </Link>
              </div>
              <p className="text-xs text-blue-200 mt-4">
                Lodging planner - find the lodging that best fits your needs and budget.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
