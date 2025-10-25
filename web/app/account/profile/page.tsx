"use client";

import { useEffect, useMemo, useState } from 'react';
import AirportAutocomplete from '@/components/AirportAutocomplete';
import type { Airport } from '@/lib/airportData';

type Profile = {
  home_airport?: { code: string; name?: string; city?: string; country?: string } | null;
  group_size?: number | null;
  children?: number | null;
  seniors?: number | null;
  mobility_issues?: boolean | null;
  budget_level?: 'budget'|'moderate'|'premium' | null;
  comfort_preference?: 'budget_friendly'|'balanced'|'luxury_focus' | null;
  food_preference?: 'local_flavors'|'international'|'mix' | null;
  nightlife_preference?: 'quiet'|'social'|'party' | null;
  climate_preference?: 'avoid_heat'|'open_to_hot'|'prefer_warm' | null;
  travel_focus?: Array<'fanfest'|'local_culture'|'stadium_experience'|'nightlife'> | null;
  preferred_transport?: 'public'|'car'|'mixed' | null;
  favorite_team?: string | null;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // form state
  const [homeAirport, setHomeAirport] = useState<Airport | undefined>(undefined);
  const [groupSize, setGroupSize] = useState(1);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [mobility, setMobility] = useState(false);

  const [budgetLevel, setBudgetLevel] = useState<'budget'|'moderate'|'premium'>('moderate');
  const [comfort, setComfort] = useState<'budget_friendly'|'balanced'|'luxury_focus'>('balanced');
  const [food, setFood] = useState<'local_flavors'|'international'|'mix'>('mix');
  const [nightlife, setNightlife] = useState<'quiet'|'social'|'party'>('social');
  const [climate, setClimate] = useState<'avoid_heat'|'open_to_hot'|'prefer_warm'>('open_to_hot');

  const [focus, setFocus] = useState<Array<'fanfest'|'local_culture'|'stadium_experience'|'nightlife'>>([]);
  const [transport, setTransport] = useState<'public'|'car'|'mixed'>('mixed');
  const [favoriteTeam, setFavoriteTeam] = useState('');

  function toggleFocus(k: 'fanfest'|'local_culture'|'stadium_experience'|'nightlife') {
    setFocus((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (res.status === 401) throw new Error('Please sign in to view your profile.');
        if (res.status === 404) {
          // No profile yet; leave defaults
          if (!active) return;
          setLoading(false);
          return;
        }
        const j: { profile: Profile } = await res.json();
        const p = j.profile || {} as Profile;
        if (!active) return;
        if (p.home_airport?.code) {
          setHomeAirport({
            code: p.home_airport.code,
            name: p.home_airport.name || '',
            city: p.home_airport.city || '',
            country: p.home_airport.country || '',
          } as Airport);
        }
        setGroupSize(p.group_size ?? 1);
        setChildren(p.children ?? 0);
        setSeniors(p.seniors ?? 0);
        setMobility(!!p.mobility_issues);
        setBudgetLevel((p.budget_level as any) || 'moderate');
        setComfort((p.comfort_preference as any) || 'balanced');
        setFood((p.food_preference as any) || 'mix');
        setNightlife((p.nightlife_preference as any) || 'social');
        setClimate((p.climate_preference as any) || 'open_to_hot');
        setFocus((p.travel_focus as any) || []);
        setTransport((p.preferred_transport as any) || 'mixed');
        setFavoriteTeam(p.favorite_team || '');
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const body: any = {
        home_airport: homeAirport ? {
          code: homeAirport.code,
          name: homeAirport.name,
          city: homeAirport.city,
          country: homeAirport.country,
        } : undefined,
        group_size: groupSize,
        children,
        seniors,
        mobility_issues: mobility,
        budget_level: budgetLevel,
        comfort_preference: comfort,
        food_preference: food,
        nightlife_preference: nightlife,
        climate_preference: climate,
        travel_focus: focus,
        preferred_transport: transport,
        favorite_team: favoriteTeam || undefined,
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = res.status === 204 ? null : await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed to save profile');
      setMessage('Profile saved');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const disabledSave = !homeAirport;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Your Travel Profile</h1>
      <p className="text-sm text-gray-500 mb-6">We use these preferences to personalize planners. Home Airport is required.</p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basics</h2>
            <div>
              <label className="block text-sm mb-2">Home Airport</label>
              <AirportAutocomplete
                value={homeAirport ? `${homeAirport.city} (${homeAirport.code}) - ${homeAirport.name}` : ''}
                onChange={(_v, ap) => setHomeAirport(ap)}
                placeholder="Search city or airport code (e.g., CDG, LHR, BOS)"
              />
              <p className="text-xs text-gray-500 mt-1">We’ll default to this for flights. You can change it anytime.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Adults</label>
                <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={1} value={groupSize}
                  onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value || '1', 10)))} />
              </div>
              <div>
                <label className="block text-sm mb-2">Children</label>
                <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={0} value={children}
                  onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value || '0', 10)))} />
              </div>
              <div>
                <label className="block text-sm mb-2">Seniors</label>
                <input type="number" className="w-full rounded border px-3 py-2 bg-white text-black" min={0} value={seniors}
                  onChange={(e) => setSeniors(Math.max(0, parseInt(e.target.value || '0', 10)))} />
              </div>
              <div className="flex items-center gap-2">
                <input id="mobility" type="checkbox" checked={mobility} onChange={(e) => setMobility(e.target.checked)} />
                <label htmlFor="mobility" className="text-sm">Someone has mobility limitations</label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Travel Style</h2>
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
                <label className="block text-sm mb-2">Comfort Preference</label>
                <select className="w-full rounded border px-3 py-2 bg-white text-black" value={comfort} onChange={(e) => setComfort(e.target.value as any)}>
                  <option value="budget_friendly">Budget friendly</option>
                  <option value="balanced">Balanced</option>
                  <option value="luxury_focus">Luxury focus</option>
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
                  <option value="avoid_heat">Avoid heat</option>
                  <option value="open_to_hot">Open to hot</option>
                  <option value="prefer_warm">Prefer warm</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Interests</h2>
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
          </section>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={save} disabled={saving || disabledSave}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            <a href="/planner" className="px-4 py-2 rounded border">Back to planners</a>
          </div>
        </div>
      )}
    </div>
  );
}
