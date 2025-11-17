'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { StoredSelection } from '@/types/trip';
import type { LodgingPlannerPlan, LodgingPlannerPreferences, LodgingMapMarker } from '@/types/lodging';
import { usePlannerTheme } from '@/hooks/usePlannerTheme';
import PlannerLoader from '@/components/PlannerLoader';
import LodgingZoneMap from '@/components/lodging/LodgingZoneMap';

const STORAGE_KEY = 'fz_selected_trip_option';

const DEFAULT_PREFERENCES: LodgingPlannerPreferences = {
  nightlyBudget: 225,
  nights: 4,
  carRental: false,
  multipleMatches: false,
  travelingWithFamily: false,
  weights: {
    stadiumProximity: 65,
    localCulture: 80,
    walkability: 72,
    nightlife: 55,
    budgetSensitivity: 62,
  },
  language: 'en',
};

const WEIGHT_FIELDS: Array<{ key: keyof LodgingPlannerPreferences['weights']; label: string; hint: string; low: string; high: string }> = [
  { key: 'stadiumProximity', label: 'Stadium proximity', hint: 'Commute priority', low: 'Longer ride ok', high: 'Need quick hop' },
  { key: 'localCulture', label: 'Local culture', hint: 'Neighborhood vibe', low: 'Modern/polished', high: 'Immersive historic' },
  { key: 'walkability', label: 'Walkability', hint: 'Transit vs. strolling', low: 'Short rides fine', high: 'Prefer on-foot days' },
  { key: 'nightlife', label: 'Nightlife & dining', hint: 'Evening energy', low: 'Calm nights', high: 'Lively late nights' },
  { key: 'budgetSensitivity', label: 'Budget sensitivity', hint: 'Flex on nightly rate', low: 'Flexible', high: 'Stay under target' },
];

export default function LodgingPlannerPage() {
  // Apply lodging planner theme
  usePlannerTheme('lodging');

  const [selection, setSelection] = useState<StoredSelection | null>(null);
  const [loadingSelection, setLoadingSelection] = useState(true);
  const [preferences, setPreferences] = useState<LodgingPlannerPreferences>(DEFAULT_PREFERENCES);
  const [plan, setPlan] = useState<LodgingPlannerPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllZones, setShowAllZones] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredSelection = JSON.parse(raw);
        setSelection(parsed);
        const nights = deriveNights(parsed);
        if (nights) {
          setPreferences((prev) => ({ ...prev, nights }));
        }
      }
    } catch (err) {
      console.error('Unable to read stored itinerary', err);
    } finally {
      setLoadingSelection(false);
    }
  }, []);

  const cityList = useMemo(() => {
    if (!selection) return [] as string[];
    if (selection.option.trip?.cityOrder?.length) return selection.option.trip.cityOrder;
    return selection.option.cities.map((c) => c.cityName);
  }, [selection]);

  const handleGenerate = async () => {
    if (!selection) return;
    setLoadingPlan(true);
    setError(null);
    try {
      const res = await fetch('/api/lodging-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection, preferences }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate lodging plan');
      setPlan(json.plan);
      setShowAllZones(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to generate lodging plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  if (loadingSelection) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading your Trip Builder selection…</p>
      </main>
    );
  }

  if (!selection) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-6">
        <section className="max-w-2xl w-full bg-white/90 backdrop-blur rounded-3xl border border-rose-100 shadow-2xl p-10 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold">Lodging Planner</p>
            <h1 className="text-3xl font-black text-gray-900">Let’s grab your itinerary first</h1>
            <p className="text-sm text-gray-700 max-w-lg mx-auto">
              The Lodging Planner pulls your selected Trip Builder option so it knows your city order, dates, and traveler count. Follow the quick steps
              below to capture it, then hop right back.
            </p>
          </div>
          <ol className="space-y-3 text-left">
            {[
              'Open Trip Builder and sign in if needed.',
              'Expand the itinerary you want to keep.',
              'Tap “Explore Lodging Zones” to stash the details and jump back here.',
            ].map((step, idx) => (
              <li key={step} className="flex items-start gap-3 bg-rose-50 rounded-2xl border border-rose-100 px-4 py-3">
                <span className="mt-0.5 h-7 w-7 flex items-center justify-center rounded-full bg-rose-600 text-white font-semibold text-sm">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-900">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <Link
              href="/planner/trip-builder"
              prefetch={false}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700"
            >
              Open Trip Builder
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full border border-rose-200 text-sm font-semibold text-gray-700 hover:bg-rose-50"
            >
              I already saved my selection
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-600 font-semibold">Step 2 of 3</p>
          <h1 className="text-4xl font-black text-gray-900">World Cup 2026 Lodging Planner</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            We imported your Trip Builder itinerary. Dial in your nightly budget, family toggles, and zone priorities—then we’ll map the highest-match
            neighborhoods, commute times, and booking guidance.
          </p>
        </header>

        <section className="bg-white/90 backdrop-blur rounded-3xl border border-rose-100 shadow-xl p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Selected itinerary</p>
              <h2 className="text-2xl font-bold text-gray-900">{selection.option.title}</h2>
              <p className="text-sm text-gray-700 mt-2 max-w-2xl">{selection.option.summary}</p>
            </div>
            <button
              onClick={() => window.open('/planner/trip-builder', '_blank')}
              className="px-4 py-2 rounded-full border border-rose-100 text-sm font-semibold text-gray-700 hover:bg-rose-50"
            >
              Switch itinerary
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-900">
            <div className="rounded-2xl bg-rose-50/80 p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Cities</p>
              <p className="font-semibold text-gray-900">{cityList.join(' → ')}</p>
            </div>
            <div className="rounded-2xl bg-rose-50/80 p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Dates</p>
              <p className="font-semibold text-gray-900">{formatDateRange(selection)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50/80 p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Travelers</p>
              <p className="font-semibold text-gray-900">{formatTravelerSummary(selection)}</p>
            </div>
          </div>
        </section>

        <section className="bg-[#fff8f5] rounded-3xl border border-rose-100 shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">Preference controls</p>
              <h3 className="text-2xl font-bold text-gray-900">Tune the Lodging Planner</h3>
            </div>
            <p className="text-xs text-gray-600">Changes auto-save locally so you can tweak and rerun instantly.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Nightly budget target</p>
                  <span className="text-lg font-bold text-gray-900">${preferences.nightlyBudget}</span>
                </div>
                <input
                  type="range"
                  min={90}
                  max={600}
                  step={10}
                  value={preferences.nightlyBudget}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, nightlyBudget: Number(e.target.value) }))}
                  className="w-full accent-rose-500"
                />
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-900">Nights to cover</span>
                <input
                  type="number"
                  min={1}
                  value={preferences.nights}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, nights: Math.max(1, Number(e.target.value) || prev.nights) }))}
                  className="rounded-2xl border border-rose-100 px-4 py-2 text-gray-900"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PreferenceToggle
                  label="Renting a car"
                  description="Unlock Zapopan + airport zones"
                  value={preferences.carRental}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, carRental: value }))}
                />
                <PreferenceToggle
                  label="Multiple matches"
                  description="Prioritize stadium hops"
                  value={preferences.multipleMatches}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, multipleMatches: value }))}
                />
                <PreferenceToggle
                  label="Family trip"
                  description="Quiet evenings + suites"
                  value={preferences.travelingWithFamily}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, travelingWithFamily: value }))}
                />
              </div>
            </div>
            <div className="space-y-4">
              {WEIGHT_FIELDS.map((weight) => (
                <div key={weight.key} className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{weight.label}</p>
                      <p className="text-xs text-gray-600">{weight.hint}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{preferences.weights[weight.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={preferences.weights[weight.key]}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        weights: { ...prev.weights, [weight.key]: Number(e.target.value) },
                      }))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mt-1">
                    <span>{weight.low}</span>
                    <span>{weight.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleGenerate}
              disabled={loadingPlan}
              className="px-6 py-3 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {loadingPlan ? 'Scoring zones…' : 'Generate lodging plan'}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-xs text-gray-600">We blend Trip Builder context + city RAG files so Gemini can score each zone.</p>}
          </div>
        </section>

        {/* Loading State */}
        {loadingPlan && selection && (
          <section>
            <PlannerLoader 
              plannerType="lodging" 
              trip={selection}
              duration={50000}
            />
          </section>
        )}

        {plan ? (
          <section className="space-y-8">
            <div className="bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-3xl p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Plan ready</p>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-3xl font-black">{plan.topRecommendation.zoneName}</h3>
                  <p className="text-sm text-white/80">{plan.travelerSummary || `Optimized for ${preferences.nightlyBudget}/night`} </p>
                </div>
                <div className="text-right">
                  <p className="text-sm uppercase text-white/70">Generated</p>
                  <p className="font-semibold">{new Date(plan.generatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-semibold">Top recommendation</p>
                    <h4 className="text-2xl font-bold text-gray-900">{plan.topRecommendation.zoneName}</h4>
                  </div>
                  <span className="text-3xl font-black text-gray-700">{plan.topRecommendation.matchScore}% match</span>
                </div>
                <div className="grid gap-3 text-sm text-gray-900">
                  <p><span className="font-semibold">Price range:</span> {plan.topRecommendation.priceRange}</p>
                  <p><span className="font-semibold">Est. total:</span> {plan.topRecommendation.estimatedTotal}</p>
                  <p><span className="font-semibold">Stadium commute:</span> {plan.topRecommendation.stadiumCommute}</p>
                  {plan.topRecommendation.fanFestCommute && (
                    <p><span className="font-semibold">Fan Fest commute:</span> {plan.topRecommendation.fanFestCommute}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Why it wins</p>
                  <ul className="text-sm text-gray-900 space-y-1 list-disc list-inside">
                    {plan.topRecommendation.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <MapPreview markers={plan.mapMarkers} />
            </div>

            <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Zone comparisons</p>
                  <p className="text-sm text-gray-700">{showAllZones ? 'All recommended areas' : 'Other strong matches'}</p>
                </div>
                {plan.zoneComparisons.length > 1 && (
                  <button
                    onClick={() => setShowAllZones((prev) => !prev)}
                    className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    {showAllZones ? 'Hide top zone' : 'See all zones'}
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(showAllZones ? plan.zoneComparisons : plan.zoneComparisons.slice(1)).map((zone) => (
                  <article key={zone.zoneName} className="rounded-2xl border border-rose-100 p-4 space-y-3 bg-rose-50/50">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">Match score</p>
                      <p className="text-2xl font-black text-gray-900">{zone.matchScore}%</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{zone.zoneName}</h4>
                      {zone.vibe && <p className="text-sm text-gray-700">{zone.vibe}</p>}
                    </div>
                    <p className="text-sm text-gray-900"><span className="font-semibold">Price:</span> {zone.priceRange}</p>
                    <p className="text-sm text-gray-900"><span className="font-semibold">Stadium commute:</span> {zone.stadiumCommute}</p>
                    {zone.fanFestCommute && (
                      <p className="text-sm text-gray-900"><span className="font-semibold">Fan Fest:</span> {zone.fanFestCommute}</p>
                    )}
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">Pros</p>
                      <ul className="text-xs text-gray-900 space-y-1 list-disc list-inside">
                        {(zone.pros.length ? zone.pros : ['Easy access, good value']).slice(0, 3).map((pro, idx) => (
                          <li key={idx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    {zone.cons.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold">Trade-offs</p>
                        <ul className="text-xs text-gray-900 space-y-1 list-disc list-inside">
                          {zone.cons.slice(0, 2).map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
                {!showAllZones && plan.zoneComparisons.slice(1).length === 0 && (
                  <div className="col-span-full text-sm text-gray-700 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                    Your top pick is the standout zone. Tap “See all zones” to review the detailed grid.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-rose-50 border border-rose-100 rounded-3xl shadow-lg p-6">
                <p className="text-xs uppercase text-gray-600 font-semibold mb-2 flex items-center gap-2">
                  <span className="text-gray-700">⚠️</span> Insights & alerts
                </p>
                <ul className="space-y-2 text-sm text-gray-900">
                  {plan.insights.map((insight, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-gray-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-3xl shadow-lg p-6">
                <p className="text-xs uppercase text-amber-600 font-semibold mb-2 flex items-center gap-2">
                  <span role="img" aria-label="calendar">🗓</span> Booking guidance
                </p>
                <ul className="space-y-2 text-sm text-amber-900">
                  {plan.bookingGuidance.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-3xl text-white p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-lg font-semibold">Next steps: export, save, or hop to Flight Planner.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
                >
                  Print / PDF
                </button>
                <button
                  onClick={() => alert('Save to Supabase profile coming soon!')}
                  className="px-4 py-2 rounded-full bg-white text-gray-700 font-semibold"
                >
                  Save plan (beta)
                </button>
                <Link
                  href="/flight-planner"
                  className="px-4 py-2 rounded-full border border-white/40 hover:bg-white/10"
                >
                  Continue to Flight Planner
                </Link>
              </div>
            </div>
          </section>
        ) : !loadingPlan ? (
          <section className="bg-white rounded-3xl border border-rose-100 shadow-inner p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Ready when you are</h3>
            <p className="text-gray-700">
              Set your nightly budget + sliders, then tap "Generate lodging plan." We'll showcase top zones, cost bands, commute times, and a printable summary.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function PreferenceToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`rounded-2xl border px-4 py-3 text-left transition ${value ? 'bg-rose-600 text-white border-rose-600' : 'border-rose-100 text-gray-900 hover:bg-rose-50'}`}
    >
      <p className="font-semibold">{label}</p>
      <p className="text-xs opacity-80">{description}</p>
    </button>
  );
}

function MapPreview({ markers }: { markers: LodgingMapMarker[] }) {
  const hasMarkers = markers && markers.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Zone map preview</p>
          <h4 className="text-lg font-semibold text-gray-900">Phase 1 heat map</h4>
        </div>
        <span className="text-xs text-gray-500">
          {hasMarkers ? 'Pan + zoom to explore' : 'Map will appear once we have zone coordinates'}
        </span>
      </div>
      {hasMarkers ? (
        <>
          <div className="relative">
            <LodgingZoneMap markers={markers} />
            <div className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-white/80 drop-shadow" aria-hidden>
              Tap to expand (Phase C map)
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {markers.map((marker) => (
              <div key={marker.name} className="rounded-2xl border border-rose-100 p-3 text-sm text-gray-900 bg-rose-50/40">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{marker.name}</p>
                  <span className="text-xs text-gray-600">{marker.matchScore}%</span>
                </div>
                <p className="text-xs text-gray-700">{marker.travelTimeToStadium || 'Commute TBD'}</p>
                {marker.travelTimeToFanFest && (
                  <p className="text-xs text-gray-700">Fan Fest: {marker.travelTimeToFanFest}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-72 w-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-center text-white/70">
          <p className="font-semibold">Map preview coming soon</p>
          <p className="text-xs max-w-xs">
            We’re collecting coordinates for this city. Once ready, you’ll see a live map with each recommended zone.
          </p>
        </div>
      )}
    </div>
  );
}

function deriveNights(selection: StoredSelection): number | null {
  const start = selection.tripInput?.startDate ? new Date(selection.tripInput.startDate) : null;
  const end = selection.tripInput?.endDate ? new Date(selection.tripInput.endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return null;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatDateRange(selection: StoredSelection) {
  const { startDate, endDate } = selection.tripInput || {};
  if (!startDate || !endDate) return 'Dates TBD';
  return `${startDate} → ${endDate}`;
}

function formatTravelerSummary(selection: StoredSelection) {
  const adults = selection.tripInput?.groupSize ?? 1;
  const kids = selection.tripInput?.children ?? 0;
  const seniors = selection.tripInput?.seniors ?? 0;
  const parts = [`${adults} adult${adults === 1 ? '' : 's'}`];
  if (kids > 0) parts.push(`${kids} kid${kids === 1 ? '' : 's'}`);
  if (seniors > 0) parts.push(`${seniors} senior${seniors === 1 ? '' : 's'}`);
  return parts.join(', ');
}
