'use client';

import React, { useEffect, useState } from 'react';
import AirportAutocomplete from './AirportAutocomplete';
import type { Airport } from '@/lib/airportData';
import type { UserProfile } from '@/lib/profile/types';
import { SoccerBallIcon, GoalIcon } from './icons/SoccerIcons';
import MatchPicker from './MatchPicker';

interface TravelPlanFormData {
  originCity: string;
  originAirport?: Airport; // Store selected airport for better data
  groupSize: number;
  children: number;
  seniors: number;
  mobilityIssues: boolean;
  citiesVisiting: string[];
  transportMode: 'public' | 'car' | 'mixed';
  budgetLevel: 'budget' | 'moderate' | 'premium';
  startDate: string;
  endDate: string;
  personalContext: string;
  // V2 additions
  hasMatchTickets: boolean;
  matchDates?: string[];
  ticketCities?: string[];
  tripFocus: Array<'fanfest' | 'local_culture' | 'stadium_experience' | 'nightlife' | 'unsure'>;
  surpriseMe?: boolean;
  comfortPreference?: 'budget_friendly' | 'balanced' | 'luxury_focus';
  nightlifePreference?: 'quiet' | 'social' | 'party';
  foodPreference?: 'local_flavors' | 'international' | 'mix';
  climatePreference?: 'all' | 'prefer_northerly' | 'comfortable';
}

export const WORLD_CUP_CITIES = [
  'Dallas',
  'Kansas City',
  'Houston',
  'Atlanta',
  'Miami',
  'Los Angeles',
  'San Francisco Bay Area',
  'Seattle',
  'Boston',
  'New York',
  'Philadelphia',
  'Toronto',
  'Vancouver',
  'Guadalajara',
  'Monterrey',
  'Mexico City'
];

interface TravelPlannerWizardProps {
  onSubmit: (data: TravelPlanFormData) => void;
  isLoading?: boolean;
  profile?: UserProfile | null;
  profileLoading?: boolean;
}

export default function TravelPlannerWizard({ onSubmit, isLoading = false, profile, profileLoading = false }: TravelPlannerWizardProps) {
  const [step, setStep] = useState(1);
  const [availableMatches, setAvailableMatches] = useState<Record<string, Array<{date:string;displayDate:string;match:string;stadium:string}>> | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TravelPlanFormData>({
    originCity: '',
    groupSize: 2,
    children: 0,
    seniors: 0,
    mobilityIssues: false,
    citiesVisiting: [],
    transportMode: 'mixed',
    budgetLevel: 'moderate',
    startDate: '',
    endDate: '',
    personalContext: '',
    hasMatchTickets: false,
    matchDates: [],
    ticketCities: [],
    tripFocus: [],
    surpriseMe: false,
    comfortPreference: undefined,
    nightlifePreference: undefined,
    foodPreference: undefined,
    climatePreference: undefined,
  });
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Compute effective total steps based on flow (tickets steps are skipped when no tickets)
  const totalSteps = formData.hasMatchTickets ? 12 : 10;

  const updateFormData = (updates: Partial<TravelPlanFormData>) => {
    setHasUserEdited(true);
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (step >= totalSteps) return;
    let next = step + 1;
    // Skip ticket-specific steps if user has no tickets
    if (!formData.hasMatchTickets && (next === 8 || next === 9)) {
      next = 10;
    }
    setStep(next);
  };

  const prevStep = () => {
    if (step <= 1) return;
    let prev = step - 1;
    // Skip ticket-specific steps if user has no tickets
    if (!formData.hasMatchTickets && (prev === 9 || prev === 8)) {
      prev = 7; // back to the hasMatchTickets question
    }
    setStep(prev);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  useEffect(() => {
    if (!profile || prefillApplied || hasUserEdited) return;
    setFormData((prev) => applyProfileDefaults(prev, profile));
    setPrefillApplied(true);
  }, [profile, prefillApplied, hasUserEdited]);
  // Load matches when tickets are enabled and inputs change
  useEffect(() => {
    const shouldFetch = formData.hasMatchTickets && ((formData.ticketCities?.length || 0) > 0);
    if (!shouldFetch) {
      setAvailableMatches(null);
      return;
    }
    const startDate = formData.startDate || '2026-06-11';
    const endDate = formData.endDate || '2026-07-19';
    const cities = formData.ticketCities && formData.ticketCities.length > 0 ? formData.ticketCities : formData.citiesVisiting;
    (async () => {
      try {
        setMatchesError(null);
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cities, startDate, endDate, group: true })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load matches');
        setAvailableMatches(data.grouped || {});
      } catch (e: any) {
        setAvailableMatches(null);
        setMatchesError(e?.message || 'Failed to load matches');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasMatchTickets, JSON.stringify(formData.ticketCities), formData.startDate, formData.endDate]);

  // If the user turns off tickets while on a ticket-only step, jump forward to the next applicable step
  useEffect(() => {
    if (!formData.hasMatchTickets && (step === 8 || step === 9)) {
      setStep(10);
    }
  }, [formData.hasMatchTickets]);

  const toggleArrayValue = <T,>(arr: T[] | undefined, value: T): T[] => {
    const list = arr ? [...arr] : [];
    const i = list.indexOf(value);
    if (i >= 0) {
      list.splice(i, 1);
    } else {
      list.push(value);
    }
    return list;
  };

  const toggleCity = (city: string) => {
    if (formData.citiesVisiting.includes(city)) {
      updateFormData({ citiesVisiting: formData.citiesVisiting.filter(c => c !== city) });
    } else {
      updateFormData({ citiesVisiting: [...formData.citiesVisiting, city] });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {profileLoading && !profile && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Loading your saved travel profile…
        </div>
      )}
      {profile && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          We prefilled your details from onboarding. Need to change them?{' '}
          <a href="/account/profile" className="font-medium text-blue-900 underline underline-offset-4">
            Edit your travel profile
          </a>
          .
        </div>
      )}
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -mt-4 transition-all duration-500 ease-out"
            style={{ 
              left: `calc(${(step / totalSteps) * 100}% - 16px)`,
              '--ball-rotation': `${(step / totalSteps) * 360}deg`,
            } as React.CSSProperties}
          >
            <SoccerBallIcon className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-1/2 right-0 -mt-3">
            <GoalIcon className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Step 1: Origin City */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Where are you traveling from?</h2>
          <p className="text-gray-600">Search by city name or airport code (e.g., "London", "LIS", "JFK")</p>
          <AirportAutocomplete
            value={formData.originCity}
            onChange={(value, airport) => {
              updateFormData({ 
                originCity: value,
                originAirport: airport 
              });
            }}
            placeholder="Start typing city or airport code..."
            autoFocus
          />
          {formData.originAirport && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ Selected: <strong>{formData.originAirport.city}</strong> ({formData.originAirport.code}) - {formData.originAirport.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Group Composition */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Who's traveling with you?</h2>
          <p className="text-gray-600">Tell us about your group so we can tailor recommendations.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Adults</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.groupSize}
                onChange={(e) => updateFormData({ groupSize: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Young Children (ages 0-12)</label>
              <input
                type="number"
                min="0"
                max="6"
                value={formData.children}
                onChange={(e) => updateFormData({ children: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seniors (65+)</label>
              <input
                type="number"
                min="0"
                max="6"
                value={formData.seniors}
                onChange={(e) => updateFormData({ seniors: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mobilityIssues"
                checked={formData.mobilityIssues}
                onChange={(e) => updateFormData({ mobilityIssues: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="mobilityIssues" className="ml-2 text-sm text-gray-700">
                Someone in our group has mobility limitations
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Cities Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Which cities will you visit?</h2>
              <p className="text-gray-600">Select all World Cup host cities you plan to attend matches in.</p>
            </div>
            <button
              onClick={() => {
                if (formData.citiesVisiting.length === WORLD_CUP_CITIES.length) {
                  updateFormData({ citiesVisiting: [] });
                } else {
                  updateFormData({ citiesVisiting: [...WORLD_CUP_CITIES] });
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {formData.citiesVisiting.length === WORLD_CUP_CITIES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORLD_CUP_CITIES.map((city) => {
              const isSelected = formData.citiesVisiting.includes(city);
              return (
                <label
                  key={city}
                  className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCity(city)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  />
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {city}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </label>
              );
            })}
          </div>

          {formData.citiesVisiting.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>{formData.citiesVisiting.length} {formData.citiesVisiting.length === 1 ? 'city' : 'cities'} selected:</strong> {formData.citiesVisiting.join(', ')}
              </p>
            </div>
          )}

          {formData.citiesVisiting.length === 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Please select at least one city to continue
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Transport Mode */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">How do you prefer to get around?</h2>
          <p className="text-gray-600">This affects lodging and logistics recommendations.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => updateFormData({ transportMode: 'public' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.transportMode === 'public'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Public Transit</div>
                  <div className="text-sm text-gray-600 mt-1">Metro, buses, trains - I want to use public transportation</div>
                </div>
                {formData.transportMode === 'public' && <span className="text-2xl">✓</span>}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ transportMode: 'car' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.transportMode === 'car'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Rental Car</div>
                  <div className="text-sm text-gray-600 mt-1">I'll rent a car for flexibility and convenience</div>
                </div>
                {formData.transportMode === 'car' && <span className="text-2xl">✓</span>}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ transportMode: 'mixed' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.transportMode === 'mixed'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Mixed / Flexible</div>
                  <div className="text-sm text-gray-600 mt-1">Combination of public transit, rideshares, and rentals</div>
                </div>
                {formData.transportMode === 'mixed' && <span className="text-2xl">✓</span>}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Budget Level */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">What's your budget level?</h2>
          <p className="text-gray-600">This helps us recommend appropriate lodging and dining options.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => updateFormData({ budgetLevel: 'budget' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.budgetLevel === 'budget'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Budget-Conscious</div>
                  <div className="text-sm text-gray-600 mt-1">~$100-150/night hotels, affordable dining, cost-effective transport</div>
                </div>
                {formData.budgetLevel === 'budget' && <span className="text-2xl">✓</span>}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ budgetLevel: 'moderate' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.budgetLevel === 'moderate'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Moderate</div>
                  <div className="text-sm text-gray-600 mt-1">~$180-250/night hotels, mix of casual and nice dining, balanced comfort</div>
                </div>
                {formData.budgetLevel === 'moderate' && <span className="text-2xl">✓</span>}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ budgetLevel: 'premium' })}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                formData.budgetLevel === 'premium'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Premium</div>
                  <div className="text-sm text-gray-600 mt-1">$300+/night hotels, fine dining, comfort and convenience prioritized</div>
                </div>
                {formData.budgetLevel === 'premium' && <span className="text-2xl">✓</span>}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Travel Dates */}
      {step === 6 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">When are you traveling?</h2>
          <p className="text-gray-600">This helps us account for peak vs. off-peak pricing and availability.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                min="2026-06-11"
                max="2026-07-19"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
                min={formData.startDate || "2026-06-11"}
                max="2026-07-19"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>World Cup 2026:</strong> June 11 - July 19, 2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Match Tickets Yes/No */}
      {step === 7 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Do you already have match tickets?</h2>
          <p className="text-gray-600">If yes, we’ll align your plan to those cities and dates.</p>
          <div className="flex items-center p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="hasMatchTickets"
              checked={formData.hasMatchTickets}
              onChange={(e) => updateFormData({ hasMatchTickets: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasMatchTickets" className="ml-3 text-sm text-gray-800">Yes — I already have tickets</label>
          </div>
          {!formData.hasMatchTickets && (
            <p className="text-sm text-gray-500">You can still pick matches later. We’ll optimize based on your cities and dates.</p>
          )}
        </div>
      )}

      {/* Step 8: Ticket Cities (only if has tickets) */}
      {step === 8 && formData.hasMatchTickets && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Which cities are your tickets in?</h2>
          <p className="text-gray-600">Select all host cities where you have match tickets.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-auto p-2 border rounded-md bg-white">
            {WORLD_CUP_CITIES.map(city => (
              <label key={city} className="flex items-center text-sm p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ticketCities?.includes(city) || false}
                  onChange={() => updateFormData({ ticketCities: toggleArrayValue(formData.ticketCities, city) })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span>{city}</span>
              </label>
            ))}
          </div>
          {(!formData.ticketCities || formData.ticketCities.length === 0) && (
            <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-3">Select at least one ticket city to continue</p>
          )}
        </div>
      )}

      {/* Step 9: Select exact matches (only if has tickets) */}
      {step === 9 && formData.hasMatchTickets && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Select your exact matches</h2>
          <p className="text-gray-600">Click a match to add its date. You can also type dates manually.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Match Dates (optional)</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD, YYYY-MM-DD"
              value={(formData.matchDates || []).join(', ')}
              onChange={(e) => updateFormData({ matchDates: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Example: 2026-06-14, 2026-06-18</p>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            {matchesError && (
              <p className="text-sm text-red-600">{matchesError}</p>
            )}
            {!matchesError && (!availableMatches || Object.keys(availableMatches).length === 0) && (
              <p className="text-sm text-gray-700">No matches found for the selected cities between {formData.startDate || '2026-06-11'} and {formData.endDate || '2026-07-19'}.</p>
            )}
            {!matchesError && availableMatches && Object.keys(availableMatches).length > 0 && (
              <div className="space-y-3 max-h-64 overflow-auto">
                {Object.keys(availableMatches).map(city => (
                  <div key={city} className="bg-white rounded border p-2">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{city}</p>
                    <ul className="space-y-1">
                      {availableMatches[city].map((m, idx) => (
                        <li key={idx}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              const newDates = new Set([...(formData.matchDates || [])]);
                              newDates.add(m.date);
                              updateFormData({ matchDates: Array.from(newDates) });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const newDates = new Set([...(formData.matchDates || [])]);
                                newDates.add(m.date);
                                updateFormData({ matchDates: Array.from(newDates) });
                              }
                            }}
                            className="w-full text-left text-sm px-3 py-2 rounded hover:bg-blue-50 border border-gray-200 cursor-pointer"
                          >
                            <span className="font-medium text-gray-900">{m.displayDate}</span>
                            <span className="text-gray-600"> — {m.match}</span>
                            <span className="text-gray-500"> @ {m.stadium}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {formData.matchDates && formData.matchDates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.matchDates.map(d => (
                  <span key={d} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {d}
                    <button onClick={() => updateFormData({ matchDates: (formData.matchDates || []).filter(x => x !== d) })} className="ml-1 text-blue-700 hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 10: Trip Focus */}
      {step === 10 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">What’s your trip focus?</h2>
          <p className="text-gray-600">Choose any that fit. We’ll tailor recommendations accordingly.</p>
          <div className="space-y-3 p-4 border rounded-lg bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'fanfest', label: 'Fan Fests & Atmosphere' },
                { key: 'local_culture', label: 'Local Culture & Food' },
                { key: 'stadium_experience', label: 'Stadium Experience' },
                { key: 'nightlife', label: 'Nightlife' },
                { key: 'unsure', label: 'Not sure yet' },
              ].map(item => (
                <label key={item.key} className={`flex items-center p-3 rounded-md border cursor-pointer ${formData.tripFocus.includes(item.key as any) ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={formData.tripFocus.includes(item.key as any)}
                    onChange={() => updateFormData({ tripFocus: toggleArrayValue(formData.tripFocus, item.key as any) })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-800">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="surpriseMe"
                checked={formData.surpriseMe || false}
                onChange={(e) => updateFormData({ surpriseMe: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="surpriseMe" className="ml-2 text-sm text-gray-700">I’m open to a creative twist (Surprise Me)</label>
            </div>
          </div>
        </div>
      )}

      {/* Step 11: Preferences */}
      {step === 11 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Any preferences to consider?</h2>
          <p className="text-gray-600">We’ll weave these into lodging, transit, and activities.</p>
          <div className="space-y-3 p-4 border rounded-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comfort</label>
                <select
                  value={formData.comfortPreference || ''}
                  onChange={(e) => updateFormData({ comfortPreference: (e.target.value || undefined) as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  <option value="budget_friendly">Budget-friendly</option>
                  <option value="balanced">Balanced</option>
                  <option value="luxury_focus">Luxury focus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nightlife</label>
                <select
                  value={formData.nightlifePreference || ''}
                  onChange={(e) => updateFormData({ nightlifePreference: (e.target.value || undefined) as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  <option value="quiet">Quiet</option>
                  <option value="social">Social</option>
                  <option value="party">Party</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food</label>
                <select
                  value={formData.foodPreference || ''}
                  onChange={(e) => updateFormData({ foodPreference: (e.target.value || undefined) as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  <option value="local_flavors">Local flavors</option>
                  <option value="international">International</option>
                  <option value="mix">Mix</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Climate</label>
                <select
                  value={formData.climatePreference || ''}
                  onChange={(e) => updateFormData({ climatePreference: (e.target.value || undefined) as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference</option>
                  <option value="all">Open to any climate</option>
                  <option value="prefer_northerly">Prefer cooler / northerly hosts</option>
                  <option value="comfortable">Prefer comfortable climates (mild temps)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 12: Anything else & Review */}
      {step === 12 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Anything else we should know?</h2>
          <p className="text-gray-600">Optional context helps us personalize your plan.</p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              value={formData.personalContext}
              onChange={(e) => updateFormData({ personalContext: e.target.value })}
              placeholder="e.g., Following England, celebrating anniversary, vegetarian, prefer beaches, first time in USA..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <h3 className="font-semibold text-lg">Quick Review</h3>
            <div className="space-y-2 text-sm">
              <p><strong>From:</strong> {formData.originCity || 'Not specified'}</p>
              <p><strong>Group:</strong> {formData.groupSize} adults{formData.children > 0 ? `, ${formData.children} children` : ''}{formData.seniors > 0 ? `, ${formData.seniors} seniors` : ''}</p>
              <p><strong>Cities:</strong> {formData.citiesVisiting.length > 0 ? formData.citiesVisiting.join(', ') : 'None selected'}</p>
              <p><strong>Transport:</strong> {formData.transportMode}</p>
              <p><strong>Budget:</strong> {formData.budgetLevel}</p>
              {formData.startDate && formData.endDate && (
                <p><strong>Dates:</strong> {formData.startDate} to {formData.endDate}</p>
              )}
              {formData.hasMatchTickets && (
                <p><strong>Tickets:</strong> {formData.ticketCities?.join(', ') || 'Cities not set'}{formData.matchDates && formData.matchDates.length ? ` on ${formData.matchDates.join(', ')}` : ''}</p>
              )}
              {formData.tripFocus.length > 0 && (
                <p><strong>Focus:</strong> {formData.tripFocus.join(', ')}{formData.surpriseMe ? ' (Surprise Me)' : ''}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={
              (step === 1 && !formData.originCity) ||
              (step === 3 && formData.citiesVisiting.length === 0) ||
              (step === 8 && formData.hasMatchTickets && ((formData.ticketCities?.length || 0) === 0))
            }
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isLoading ? 'Generating Your Itinerary...' : 'Generate My Itinerary ✨'}
          </button>
        )}
      </div>
    </div>
  );
}

function mapProfileAirport(home?: UserProfile['home_airport'] | null): Airport | null {
  if (!home?.code) return null;
  return {
    code: home.code,
    name: home.name || home.code,
    city: home.city || '',
    country: home.country || '',
  };
}

function formatAirportLabel(airport: Airport) {
  const city = airport.city || airport.name || airport.code;
  const name = airport.name || airport.code;
  return `${city} (${airport.code}) - ${name}`;
}

function deriveChildrenFromProfile(profile: UserProfile): number {
  const buckets = (profile.children_0_5 ?? 0) + (profile.children_6_18 ?? 0);
  if (buckets > 0) return buckets;
  return profile.children ?? 0;
}

function applyProfileDefaults(prev: TravelPlanFormData, profile: UserProfile): TravelPlanFormData {
  let changed = false;
  const next: TravelPlanFormData = { ...prev };
  const airport = mapProfileAirport(profile.home_airport);

  if (airport) {
    if (!prev.originAirport) {
      next.originAirport = airport;
      changed = true;
    }
    if (!prev.originCity) {
      next.originCity = formatAirportLabel(airport);
      changed = true;
    }
  } else if (!prev.originCity && profile.home_city) {
    next.originCity = profile.home_city;
    changed = true;
  }

  if (typeof profile.group_size === 'number' && profile.group_size > 0 && profile.group_size !== prev.groupSize) {
    next.groupSize = profile.group_size;
    changed = true;
  }

  const kids = deriveChildrenFromProfile(profile);
  if (kids > 0 && kids !== prev.children) {
    next.children = kids;
    changed = true;
  }

  if (typeof profile.seniors === 'number' && profile.seniors !== prev.seniors) {
    next.seniors = profile.seniors;
    changed = true;
  }

  if (typeof profile.mobility_issues === 'boolean' && profile.mobility_issues !== prev.mobilityIssues) {
    next.mobilityIssues = profile.mobility_issues;
    changed = true;
  }

  if (profile.preferred_transport && profile.preferred_transport !== prev.transportMode) {
    next.transportMode = profile.preferred_transport as TravelPlanFormData['transportMode'];
    changed = true;
  }

  if (profile.budget_level && profile.budget_level !== prev.budgetLevel) {
    next.budgetLevel = profile.budget_level as TravelPlanFormData['budgetLevel'];
    changed = true;
  }

  if ((!prev.tripFocus || prev.tripFocus.length === 0) && Array.isArray(profile.travel_focus) && profile.travel_focus.length) {
    next.tripFocus = profile.travel_focus as TravelPlanFormData['tripFocus'];
    changed = true;
  }

  if (!prev.foodPreference && profile.food_preference) {
    next.foodPreference = profile.food_preference as NonNullable<TravelPlanFormData['foodPreference']>;
    changed = true;
  }

  if (!prev.nightlifePreference && profile.nightlife_preference) {
    next.nightlifePreference = profile.nightlife_preference as NonNullable<TravelPlanFormData['nightlifePreference']>;
    changed = true;
  }

  if (!prev.climatePreference && profile.climate_preference) {
    next.climatePreference = profile.climate_preference as NonNullable<TravelPlanFormData['climatePreference']>;
    changed = true;
  }

  const ticketCity = profile.ticket_match?.city?.trim();
  const ticketDate = profile.ticket_match?.date?.trim();

  if (profile.has_tickets) {
    if (!prev.hasMatchTickets) {
      next.hasMatchTickets = true;
      changed = true;
    }
    if ((!prev.ticketCities || prev.ticketCities.length === 0) && ticketCity) {
      next.ticketCities = [ticketCity];
      changed = true;
    }
    if ((!prev.matchDates || prev.matchDates.length === 0) && ticketDate) {
      next.matchDates = [ticketDate];
      changed = true;
    }
  }

  if ((!prev.citiesVisiting || prev.citiesVisiting.length === 0) && ticketCity) {
    next.citiesVisiting = [ticketCity];
    changed = true;
  }

  if (!prev.startDate && ticketDate) {
    next.startDate = ticketDate;
    changed = true;
  }

  if (!prev.endDate && ticketDate) {
    next.endDate = ticketDate;
    changed = true;
  }

  return changed ? next : prev;
}
