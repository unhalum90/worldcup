"use client";

import { useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '@/lib/profile/types';
import { WORLD_CUP_CITIES } from '@/components/TravelPlannerWizard';
import MatchPicker from '@/components/MatchPicker';
import type { MatchItem } from '@/lib/matchSchedule';
import { createMatchKey, extractDateFromMatchKey, sortMatchKeys } from '@/lib/matchSelection';

type TravelPlanRequest = {
  originCity: string;
  originAirport?: any;
  groupSize: number;
  children: number;
  seniors: number;
  mobilityIssues: boolean;
  citiesVisiting: string[];
  transportMode: 'public' | 'car' | 'mixed';
  budgetLevel: 'budget' | 'moderate' | 'premium';
  startDate: string;
  endDate: string;
  personalContext?: string;
  hasMatchTickets: boolean;
  matchDates?: string[];
  ticketCities?: string[];
  surpriseMe?: boolean;
  tripFocus?: string[];
  comfortPreference?: string | null;
  nightlifePreference?: string | null;
  foodPreference?: string | null;
  climatePreference?: string | null;
};

interface TripIntentFormProps {
  profile: UserProfile;
  onSubmit: (payload: TravelPlanRequest) => Promise<void> | void;
  isLoading: boolean;
  onBack?: () => void;
}

export default function TripIntentForm({ profile, onSubmit, isLoading, onBack }: TripIntentFormProps) {
  const [storedTicketMatches, setStoredTicketMatches] = useState<MatchItem[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('fz_onboarding_ticket_matches');
      if (raw) {
        setStoredTicketMatches(JSON.parse(raw));
      }
    } catch {
      setStoredTicketMatches([]);
    }
  }, []);
  const defaultCities = useMemo(() => {
    const set = new Set<string>();
    if (profile.ticket_match?.city) set.add(profile.ticket_match.city);
    storedTicketMatches.forEach((m) => set.add(m.city));
    return Array.from(set);
  }, [profile.ticket_match?.city, storedTicketMatches]);

  const defaultMatchSelections = useMemo(() => {
    const set = new Set<string>();
    const profileKey = createMatchKey(profile.ticket_match?.city ?? null, profile.ticket_match?.date ?? null);
    if (profileKey) set.add(profileKey);
    storedTicketMatches.forEach((m) => {
      const key = createMatchKey(m.city, m.date);
      if (key) set.add(key);
    });
    return Array.from(set);
  }, [profile.ticket_match?.city, profile.ticket_match?.date, storedTicketMatches]);

  const [citiesVisiting, setCitiesVisiting] = useState<string[]>(defaultCities);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasTickets, setHasTickets] = useState(Boolean(profile.has_tickets) || storedTicketMatches.length > 0);
  const [ticketCities, setTicketCities] = useState<string[]>(defaultCities);
  const [matchSelections, setMatchSelections] = useState<string[]>(sortMatchKeys(defaultMatchSelections));
  const [personalContext, setPersonalContext] = useState('');
  const [error, setError] = useState<string | null>(null);

  const disabled =
    !startDate ||
    !endDate ||
    citiesVisiting.length === 0 ||
    (hasTickets && ticketCities.length === 0);

  useEffect(() => {
    if (defaultCities.length && citiesVisiting.length === 0) {
      setCitiesVisiting(defaultCities);
    }
    if (defaultCities.length && ticketCities.length === 0) {
      setTicketCities(defaultCities);
    }
    if (defaultMatchSelections.length && matchSelections.length === 0) {
      setMatchSelections(sortMatchKeys(defaultMatchSelections));
    }
    if (storedTicketMatches.length && !hasTickets) {
      setHasTickets(true);
    }
  }, [defaultCities, defaultMatchSelections, citiesVisiting.length, ticketCities.length, matchSelections.length, storedTicketMatches, hasTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after the start date.');
      return;
    }

    try {
      const payload = buildPayloadFromProfile(profile);
      const matchDatesForPayload = hasTickets
        ? Array.from(
            new Set(
              matchSelections
                .map(extractDateFromMatchKey)
                .filter((date): date is string => Boolean(date))
            )
          )
        : [];
      await onSubmit({
        ...payload,
        citiesVisiting,
        startDate,
        endDate,
        personalContext,
        hasMatchTickets: hasTickets,
        ticketCities: hasTickets ? ticketCities : [],
        matchDates: matchDatesForPayload,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit');
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Step 2</p>
            <h2 className="text-2xl font-bold text-gray-900">Tell us about this specific trip</h2>
            <p className="text-sm text-gray-600 mt-1">
              We already have your traveler profile. Now just add the trip details—we’ll merge everything before generating your itinerary.
            </p>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              ← Back to profile review
            </button>
          )}
        </div>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Dates</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min="2026-06-01"
                max="2026-07-31"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || '2026-06-01'}
                max="2026-07-31"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Which host cities are you planning to visit?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORLD_CUP_CITIES.map((city) => {
              const isSelected = citiesVisiting.includes(city);
              return (
                <button
                  type="button"
                  key={city}
                  onClick={() => setCitiesVisiting((prev) => toggleCityList(prev, city))}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    isSelected ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{city}</span>
                  {isSelected && <span className="ml-2 text-xs text-blue-700 font-semibold">Selected</span>}
                </button>
              );
            })}
          </div>
          {citiesVisiting.length === 0 && <p className="text-xs text-red-500">Select at least one city.</p>}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Match tickets</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={hasTickets}
                onChange={(e) => {
                  setHasTickets(e.target.checked);
                  if (!e.target.checked) {
                    setTicketCities([]);
                    setMatchSelections([]);
                  } else if (ticketCities.length === 0 && defaultCities.length) {
                    setTicketCities(defaultCities);
                    setMatchSelections(sortMatchKeys(defaultMatchSelections));
                  }
                }}
              />
              Yes — align my trip to existing tickets
            </label>
          </div>
          {hasTickets && (
            <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-blue-50/50">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">Which cities are those tickets for?</p>
                <div className="flex flex-wrap gap-2">
                  {WORLD_CUP_CITIES.map((city) => {
                    const isSelected = ticketCities.includes(city);
                    return (
                      <button
                        type="button"
                        key={`ticket-${city}`}
                        onClick={() => setTicketCities((prev) => toggleCityList(prev, city))}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
                {ticketCities.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one city with tickets.</p>}
              </div>
              <MatchPicker
                selectedCities={ticketCities}
                startDate={startDate}
                endDate={endDate}
                selectedMatchKeys={matchSelections}
                onChangeMatchKeys={(keys) => setMatchSelections(sortMatchKeys(keys))}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Anything else for this trip?</h3>
            <span className="text-xs text-gray-500">Optional</span>
          </div>
          <textarea
            value={personalContext}
            onChange={(e) => setPersonalContext(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="e.g., Celebrating a birthday, need vegetarian options, split-time in Toronto & Vancouver…"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Planning…' : 'Generate my trip'}
          </button>
          <p className="text-sm text-gray-500">
            You can always tweak preferences later—this adds trip-specific context on top of your profile.
          </p>
        </div>
      </form>
    </section>
  );
}

function toggleCityList(list: string[], city: string) {
  if (list.includes(city)) {
    return list.filter((c) => c !== city);
  }
  return [...list, city];
}

function buildPayloadFromProfile(profile: UserProfile): TravelPlanRequest {
  const airport = profile.home_airport;
  const originCity = airport
    ? `${airport.city || airport.name || airport.code} (${airport.code}) - ${airport.name}`
    : profile.home_city || 'Home city not set';
  const children = (profile.children_0_5 ?? 0) + (profile.children_6_18 ?? 0) || profile.children || 0;

  return {
    originCity,
    originAirport: airport || undefined,
    groupSize: profile.group_size ?? 1,
    children,
    seniors: profile.seniors ?? 0,
    mobilityIssues: Boolean(profile.mobility_issues),
    transportMode: (profile.preferred_transport as 'public' | 'car' | 'mixed') || 'mixed',
    budgetLevel: (profile.budget_level as 'budget' | 'moderate' | 'premium') || 'moderate',
    citiesVisiting: [],
    startDate: '',
    endDate: '',
    hasMatchTickets: Boolean(profile.has_tickets),
    ticketCities: profile.ticket_match?.city ? [profile.ticket_match.city] : [],
    matchDates: profile.ticket_match?.date ? [profile.ticket_match.date] : [],
    tripFocus: profile.travel_focus || [],
    surpriseMe: false,
    nightlifePreference: profile.nightlife_preference || null,
    foodPreference: profile.food_preference || null,
    climatePreference: profile.climate_preference || null,
  };
}
