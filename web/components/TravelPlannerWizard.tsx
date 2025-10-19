'use client';

import { useState } from 'react';
import AirportAutocomplete from './AirportAutocomplete';
import type { Airport } from '@/lib/airportData';

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
}

const WORLD_CUP_CITIES = [
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
}

export default function TravelPlannerWizard({ onSubmit, isLoading = false }: TravelPlannerWizardProps) {
  const [step, setStep] = useState(1);
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
    personalContext: ''
  });

  const totalSteps = 7;

  const updateFormData = (updates: Partial<TravelPlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
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

      {/* Step 7: Personal Context & Review */}
      {step === 7 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Any special requests or context?</h2>
          <p className="text-gray-600">Tell us anything else that would help us personalize your itinerary.</p>
          
          <textarea
            value={formData.personalContext}
            onChange={(e) => updateFormData({ personalContext: e.target.value })}
            placeholder="e.g., Following England team, celebrating anniversary, first time in USA, prefer staying near beaches, vegetarian dietary needs..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Summary */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <h3 className="font-semibold text-lg">Your Trip Summary</h3>
            <div className="space-y-2 text-sm">
              <p><strong>From:</strong> {formData.originCity || 'Not specified'}</p>
              <p><strong>Group:</strong> {formData.groupSize} adults{formData.children > 0 ? `, ${formData.children} children` : ''}{formData.seniors > 0 ? `, ${formData.seniors} seniors` : ''}</p>
              <p><strong>Cities:</strong> {formData.citiesVisiting.length > 0 ? formData.citiesVisiting.join(', ') : 'None selected'}</p>
              <p><strong>Transport:</strong> {formData.transportMode}</p>
              <p><strong>Budget:</strong> {formData.budgetLevel}</p>
              {formData.startDate && formData.endDate && (
                <p><strong>Dates:</strong> {formData.startDate} to {formData.endDate}</p>
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
              (step === 3 && formData.citiesVisiting.length === 0)
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
