"use client";

import Link from 'next/link';
import type { UserProfile } from '@/lib/profile/types';

interface ProfileReviewProps {
  profile: UserProfile;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ProfileReview({ profile, onConfirm, onEdit }: ProfileReviewProps) {
  const home = formatHome(profile);
  const group = formatGroup(profile);
  const travelStyle = formatTravelStyle(profile);
  const focus = (profile.travel_focus || []).map((f) => focusLabels[f] || f);
  const ticketSummary = formatTickets(profile);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Step 1</p>
        <h2 className="text-2xl font-bold text-gray-900">Review your travel profile</h2>
        <p className="text-sm text-gray-600 mt-1">
          We’ll use these saved preferences across every trip. Confirm what we have on file or update anything first.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Home base" value={home} />
        <Card title="Group & accessibility" value={group} />
        <Card title="Travel style" value={travelStyle} />
        <Card title="Transport preference" value={transportLabel(profile.preferred_transport)} />
        <Card title="Focus areas" value={focus.length ? focus.join(', ') : 'No specific focus selected'} />
        <Card title="Tickets on hand" value={ticketSummary} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Looks good — continue
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Make changes first
        </button>
        <Link href="/onboarding" className="text-sm text-gray-500 underline underline-offset-2">
          Start onboarding again
        </Link>
      </div>
    </section>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{title}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}

function formatHome(profile: UserProfile) {
  if (profile.home_airport?.code) {
    const ap = profile.home_airport;
    return `${ap.city || ap.name || ap.code} (${ap.code}) • ${ap.name}`;
  }
  return profile.home_city || 'Not set';
}

function formatGroup(profile: UserProfile) {
  const adults = profile.group_size ?? 1;
  const kids = (profile.children_0_5 ?? 0) + (profile.children_6_18 ?? 0);
  const seniors = profile.seniors ?? 0;
  const parts = [`${adults} adult${adults === 1 ? '' : 's'}`];
  if (kids > 0) parts.push(`${kids} kid${kids === 1 ? '' : 's'}`);
  if (seniors > 0) parts.push(`${seniors} senior${seniors === 1 ? '' : 's'}`);
  if (profile.mobility_issues) parts.push('Mobility considerations noted');
  return parts.join(' • ');
}

function transportLabel(pref?: string | null) {
  if (pref === 'public') return 'Public transit';
  if (pref === 'car') return 'Car / rental';
  return 'Mixed transport';
}

function formatTravelStyle(profile: UserProfile) {
  const items = [
    budgetLabels[profile.budget_level || ''] || null,
    comfortLabels[profile.comfort_preference || ''] || null,
    foodLabels[profile.food_preference || ''] || null,
    nightlifeLabels[profile.nightlife_preference || ''] || null,
    climateLabels[profile.climate_preference || ''] || null,
  ].filter(Boolean);
  return items.length ? items.join(' • ') : 'No preferences saved yet';
}

function formatTickets(profile: UserProfile) {
  if (!profile.has_tickets || !profile.ticket_match) {
    return 'No tickets on file';
  }
  const m = profile.ticket_match;
  const date = m.date ? new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const parts = [m.match, m.city, date].filter(Boolean);
  return parts.join(' • ');
}

const budgetLabels: Record<string, string> = {
  budget: 'Budget traveler',
  moderate: 'Moderate budget',
  premium: 'Premium comfort',
};

const comfortLabels: Record<string, string> = {
  budget_friendly: 'Comfort: Budget-friendly',
  balanced: 'Comfort: Balanced',
  luxury_focus: 'Comfort: Luxury focus',
};

const foodLabels: Record<string, string> = {
  local_flavors: 'Food: Local flavors',
  international: 'Food: International favorites',
  mix: 'Food: Mix of both',
};

const nightlifeLabels: Record<string, string> = {
  quiet: 'Nightlife: Quiet evenings',
  social: 'Nightlife: Social outings',
  party: 'Nightlife: Party vibe',
};

const climateLabels: Record<string, string> = {
  all: 'Open to any climate',
  prefer_northerly: 'Prefers cooler hosts',
  comfortable: 'Prefers mild climates',
};

const focusLabels: Record<string, string> = {
  fanfest: 'Fan Fests & atmosphere',
  local_culture: 'Local culture & food',
  stadium_experience: 'Stadium experience',
  nightlife: 'Nightlife',
};
