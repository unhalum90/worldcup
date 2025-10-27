"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type Profile = {
  user_id: string
  email?: string | null
  name?: string | null
  avatar_url?: string | null
  account_level?: 'free' | 'city_bundle' | 'member'
  subscription_tier?: 'free' | 'premium' | 'pro'
  subscription_status?: 'active' | 'cancelled' | 'expired' | 'trialing'
  // Onboarding fields
  home_airport?: { code: string; name: string; city: string; country: string } | null
  group_size?: number
  children_0_5?: number
  children_6_18?: number
  seniors?: number
  mobility_issues?: boolean
  budget_level?: 'budget' | 'moderate' | 'premium' | null
  food_preference?: 'local_flavors' | 'international' | 'mix' | null
  nightlife_preference?: 'quiet' | 'social' | 'party' | null
  climate_preference?: 'all' | 'prefer_northerly' | 'comfortable' | null
  travel_focus?: string[] | null
  preferred_transport?: 'public' | 'car' | 'mixed' | null
  favorite_team?: string | null
  has_tickets?: boolean | null
  ticket_match?: {
    country: string;
    city: string;
    stadium: string;
    date: string;
    match: string;
  } | null
}

export default function ProfileCard({ profile, user }: { profile: Profile | null; user: any }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const email = profile?.email || user?.email || ''
  const name = profile?.name || user?.user_metadata?.name || ''
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const level = profile?.account_level || 'free'
  const tier = profile?.subscription_tier || 'free'
  const status = profile?.subscription_status || 'active'

  // Check if user has completed onboarding
  const hasOnboardingData = profile?.home_airport && profile?.group_size

  const formatTravelFocus = (focus: string[]) => {
    const labels: Record<string, string> = {
      'fanfest': 'Fan Fests & Atmosphere',
      'local_culture': 'Local Culture & Food', 
      'stadium_experience': 'Stadium Experience',
      'nightlife': 'Nightlife'
    }
    return focus.map(f => labels[f] || f).join(', ')
  }

  const formatTravelerCount = () => {
    const adults = profile?.group_size || 0
    const children05 = profile?.children_0_5 || 0
    const children618 = profile?.children_6_18 || 0
    const seniors = profile?.seniors || 0
    
    const parts = []
    if (adults > 0) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`)
    if (children05 > 0) parts.push(`${children05} child${children05 === 1 ? '' : 'ren'} (0-5)`)
    if (children618 > 0) parts.push(`${children618} child${children618 === 1 ? '' : 'ren'} (6-18)`)
    if (seniors > 0) parts.push(`${seniors} senior${seniors === 1 ? '' : 's'}`)
    
    return parts.join(', ')
  }

  return (
    <div className="space-y-4">
      {/* Basic Profile Info */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-gray-500">👤</div>
          )}
        </div>
        <div>
          <div className="text-base font-medium">{name || 'Anonymous'}</div>
          <div className="text-sm text-gray-500">{email}</div>
          <div className="mt-1 text-sm">Account: <span className="font-medium capitalize">{level}</span></div>
          <div className="text-xs text-gray-500">Tier: {tier} • Status: {status}</div>
        </div>
      </div>

      {/* Onboarding Profile Details */}
      {hasOnboardingData && (
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Travel Profile Details</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {profile?.home_airport && (
                  <div>
                    <span className="font-medium text-gray-700">Home Airport:</span>
                    <div className="text-gray-600">{profile.home_airport.code} - {profile.home_airport.name}</div>
                    <div className="text-xs text-gray-500">{profile.home_airport.city}, {profile.home_airport.country}</div>
                  </div>
                )}
                
                {profile?.group_size && (
                  <div>
                    <span className="font-medium text-gray-700">Travelers:</span>
                    <div className="text-gray-600">{formatTravelerCount()}</div>
                  </div>
                )}
                
                {profile?.favorite_team && (
                  <div>
                    <span className="font-medium text-gray-700">Favorite Team:</span>
                    <div className="text-gray-600">{profile.favorite_team}</div>
                  </div>
                )}
                
                {profile?.budget_level && (
                  <div>
                    <span className="font-medium text-gray-700">Budget Level:</span>
                    <div className="text-gray-600 capitalize">{profile.budget_level}</div>
                  </div>
                )}
                
                {profile?.food_preference && (
                  <div>
                    <span className="font-medium text-gray-700">Food Preference:</span>
                    <div className="text-gray-600 capitalize">{profile.food_preference.replace('_', ' ')}</div>
                  </div>
                )}
                
                {profile?.nightlife_preference && (
                  <div>
                    <span className="font-medium text-gray-700">Nightlife:</span>
                    <div className="text-gray-600 capitalize">{profile.nightlife_preference}</div>
                  </div>
                )}
                
                {profile?.climate_preference && (
                  <div>
                    <span className="font-medium text-gray-700">Climate Preference:</span>
                    <div className="text-gray-600 capitalize">{profile.climate_preference.replace('_', ' ')}</div>
                  </div>
                )}
                
                {profile?.preferred_transport && (
                  <div>
                    <span className="font-medium text-gray-700">Transport:</span>
                    <div className="text-gray-600 capitalize">{profile.preferred_transport}</div>
                  </div>
                )}
                
                {profile?.travel_focus && profile.travel_focus.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Interests:</span>
                    <div className="text-gray-600">{formatTravelFocus(profile.travel_focus)}</div>
                  </div>
                )}
                
                {profile?.has_tickets && profile?.ticket_match && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Match Tickets:</span>
                    <div className="text-gray-600">{profile.ticket_match.match}</div>
                    <div className="text-xs text-gray-500">
                      {profile.ticket_match.stadium}, {profile.ticket_match.city} • {profile.ticket_match.date}
                    </div>
                  </div>
                )}
                
                {profile?.mobility_issues && (
                  <div>
                    <span className="font-medium text-gray-700">Accessibility:</span>
                    <div className="text-gray-600">Mobility accommodations needed</div>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <Link 
                  href="/account/profile"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboarding CTA if no profile data */}
      {!hasOnboardingData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Complete Your Travel Profile</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get personalized recommendations by completing your travel preferences.
              </p>
              <Link 
                href="/onboarding"
                className="inline-flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                Complete Profile
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
