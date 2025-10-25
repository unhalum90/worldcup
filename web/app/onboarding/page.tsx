"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AirportAutocomplete from '@/components/AirportAutocomplete';
import type { Airport } from '@/lib/airportData';
import { loadMatchScheduleSync, type MatchItem } from '@/lib/matchSchedule';

type Step = 1 | 2 | 3 | 4; // 4=done screen

export default function OnboardingPage() {
  const search = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [homeAirport, setHomeAirport] = useState<Airport | undefined>(undefined);
  const [groupSize, setGroupSize] = useState(2);
  const [children05, setChildren05] = useState(0);
  const [children618, setChildren618] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [mobility, setMobility] = useState(false);

  const [budgetLevel, setBudgetLevel] = useState<'budget'|'moderate'|'premium'>('moderate');
  const [food, setFood] = useState<'local_flavors'|'international'|'mix'>('mix');
  const [nightlife, setNightlife] = useState<'quiet'|'social'|'party'>('social');
  const [climate, setClimate] = useState<'all'|'prefer_northerly'|'comfortable'>('all');

  const [focus, setFocus] = useState<Array<'fanfest'|'local_culture'|'stadium_experience'|'nightlife'>>([]);
  const [transport, setTransport] = useState<'public'|'car'|'mixed'>('mixed');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [hasTickets, setHasTickets] = useState(false);
  const [ticketMatch, setTicketMatch] = useState<MatchItem | null>(null);
  const matches = useMemo(() => loadMatchScheduleSync(), []);

  function toggleFocus(k: 'fanfest'|'local_culture'|'stadium_experience'|'nightlife') {
    setFocus((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }

  const redirectTarget = useMemo(() => {
    const raw = search?.get('redirect') || '';
    // Sanitize: allow only same-origin relative paths
    if (!raw) return null;
    if (raw.startsWith('//')) return null;
    if (!raw.startsWith('/')) return null;
    // Avoid API/internal routes by default
    if (raw.startsWith('/api')) return null;
    return raw;
  }, [search]);

  const fromMembership = useMemo(() => {
    const f = (search?.get('from') || '').toLowerCase();
    return f === 'membership' || f === 'subscribe' || f === 'checkout';
  }, [search]);

  async function submitProfile() {
    setLoading(true);
    setError(null);
    try {
      const body: any = {
        home_airport: homeAirport ? {
          code: homeAirport.code,
          name: homeAirport.name,
          city: homeAirport.city,
          country: homeAirport.country,
        } : undefined,
        group_size: groupSize,
        children_0_5: children05,
        children_6_18: children618,
        seniors,
        mobility_issues: mobility,
        budget_level: budgetLevel,
        food_preference: food,
        nightlife_preference: nightlife,
        climate_preference: climate,
        travel_focus: focus,
        preferred_transport: transport,
        favorite_team: favoriteTeam || undefined,
        has_tickets: hasTickets,
        ticket_match: hasTickets && ticketMatch ? {
          country: ticketMatch.country,
          city: ticketMatch.city,
          stadium: ticketMatch.stadium,
          date: ticketMatch.date,
          match: ticketMatch.match,
        } : undefined,
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = res.status === 204 ? null : await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed to save profile');
      // Mark onboarding complete (sets cookie)
      try {
        await fetch(`/api/onboarding/complete${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`, { method: 'POST' });
      } catch {}
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  const disabledNext1 = !homeAirport;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{fromMembership ? 'Thanks for becoming a member!' : 'Welcome! Let’s personalize your experience'}</h1>
      <p className="text-sm text-gray-500 mb-6">Complete these quick steps once. We’ll use them across all planners.</p>

      {/* Progress */}
      <div className="mb-6">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-2 bg-blue-500" style={{ width: `${(step-1)/3*100}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1">Step {Math.min(step,3)} of 3</div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Step 1 — Traveler Basics</h2>
          <div>
            <label className="block text-sm mb-2">Home Airport</label>
            <AirportAutocomplete
              value={homeAirport ? `${homeAirport.city} (${homeAirport.code}) - ${homeAirport.name}` : ''}
              onChange={(_v, ap) => setHomeAirport(ap)}
              placeholder="Search city or airport code (e.g., CDG, LHR, BOS)"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">We’ll default to this for flights. You can change it any time.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Adults</label>
              <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={1} value={groupSize}
                onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value || '1', 10)))} />
            </div>
            <div>
              <label className="block text-sm mb-2">Children 0–5</label>
              <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={0} value={children05}
                onChange={(e) => setChildren05(Math.max(0, parseInt(e.target.value || '0', 10)))} />
            </div>
            <div>
              <label className="block text-sm mb-2">Seniors</label>
              <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={0} value={seniors}
                onChange={(e) => setSeniors(Math.max(0, parseInt(e.target.value || '0', 10)))} />
            </div>
            <div>
              <label className="block text-sm mb-2">Children 6–18</label>
              <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={0} value={children618}
                onChange={(e) => setChildren618(Math.max(0, parseInt(e.target.value || '0', 10)))} />
            </div>
            <div className="flex items-center gap-2">
              <input id="mobility" type="checkbox" checked={mobility} onChange={(e) => setMobility(e.target.checked)} />
              <label htmlFor="mobility" className="text-sm">Someone has mobility limitations</label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input id="tickets" type="checkbox" checked={hasTickets} onChange={(e) => setHasTickets(e.target.checked)} />
              <label htmlFor="tickets" className="text-sm">We already have match tickets</label>
            </div>
            {hasTickets && (
              <div>
                <label className="block text-sm mb-2">Which match?</label>
                <select className="w-full rounded border px-3 py-2 bg-white text-black" value={ticketMatch ? `${ticketMatch.date}|${ticketMatch.city}|${ticketMatch.match}` : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const found = matches.find(m => `${m.date}|${m.city}|${m.match}` === v) || null;
                    setTicketMatch(found);
                  }}>
                  <option value="">Select a match…</option>
                  {matches.map((m) => (
                    <option key={`${m.date}-${m.city}-${m.match}`} value={`${m.date}|${m.city}|${m.match}`}>
                      {m.date} — {m.city} — {m.match} ({m.stadium})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={() => setStep(2)} disabled={disabledNext1}>Next</button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Step 2 — Travel Style</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Budget Level</label>
              <select className="w-full rounded border px-3 py-2 bg-white text-black" value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value as any)}>
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Food Preference</label>
              <select className="w-full rounded border px-3 py-2 bg-white text-black" value={food} onChange={(e) => setFood(e.target.value as any)}>
                <option value="local_flavors">Local flavors</option>
                <option value="international">International</option>
                <option value="mix">Mix</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Nightlife Preference</label>
              <select className="w-full rounded border px-3 py-2 bg-white text-black" value={nightlife} onChange={(e) => setNightlife(e.target.value as any)}>
                <option value="quiet">Quiet</option>
                <option value="social">Social</option>
                <option value="party">Party</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Climate Preference</label>
              <select className="w-full rounded border px-3 py-2 bg-white text-black" value={climate} onChange={(e) => setClimate(e.target.value as any)}>
                <option value="all">Open to all climates</option>
                <option value="prefer_northerly">Prefer northerly</option>
                <option value="comfortable">Comfortable climates</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={() => setStep(1)}>Back</button>
            <button className="px-4 py-2 rounded border" onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Step 3 — Interests</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { key: 'fanfest', label: 'Fan Fests & Atmosphere' },
              { key: 'local_culture', label: 'Local Culture & Food' },
              { key: 'stadium_experience', label: 'Stadium Experience' },
              { key: 'nightlife', label: 'Nightlife' },
            ].map((it) => (
              <label key={it.key} className={`flex items-center gap-2 p-3 rounded border cursor-pointer ${focus.includes(it.key as any) ? 'border-blue-500 bg-blue-50' : ''}`}>
                <input type="checkbox" checked={focus.includes(it.key as any)} onChange={() => toggleFocus(it.key as any)} />
                <span className="text-sm">{it.label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm mb-2">Preferred Transport</label>
            <select className="w-full rounded border px-3 py-2 bg-white text-black" value={transport} onChange={(e) => setTransport(e.target.value as any)}>
              <option value="public">Public Transit</option>
              <option value="car">Car / Rental</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Favorite Team (optional)</label>
            <input className="w-full rounded border px-3 py-2 bg-white text-black" value={favoriteTeam} onChange={(e) => setFavoriteTeam(e.target.value)} placeholder="e.g., England" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={() => setStep(2)}>Back</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" onClick={submitProfile} disabled={loading}>
              {loading ? 'Saving…' : 'Finish'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">You’re all set!</h2>
          <p className="text-sm text-gray-400">We’ll personalize all planners using your profile. You can edit this anytime.</p>
          <div className="flex gap-3">
            <a href={redirectTarget || '/planner'} className="px-4 py-2 rounded bg-blue-600 text-white">
              {redirectTarget ? 'Continue' : 'Open Trip Builder'}
            </a>
            <a href="/account/profile" className="px-4 py-2 rounded border">Edit Profile</a>
          </div>
        </div>
      )}
    </div>
  );
}
