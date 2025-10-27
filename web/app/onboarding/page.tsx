"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AirportAutocomplete from '@/components/AirportAutocomplete';
import { trackEvent } from '@/components/GoogleAnalytics';
import { useTranslations } from 'next-intl';
import type { Airport } from '@/lib/airportData';
import { loadMatchScheduleSync, type MatchItem } from '@/lib/matchSchedule';
import { teamColors } from '@/lib/constants/teamColors';

type Step = 1 | 2 | 3 | 4; // 4=done screen

export default function OnboardingPage() {
  const search = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('onboarding');

  // Form state
  const [homeAirportInput, setHomeAirportInput] = useState('');
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

  const [focus, setFocus] = useState<Array<'fanfest'|'local_culture'|'stadium_experience'>>([]);
  const [transport, setTransport] = useState<'public'|'car'|'mixed'>('mixed');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [hasTickets, setHasTickets] = useState(false);
  const [ticketEntryMode, setTicketEntryMode] = useState<'single' | 'multi'>('single');
  const [ticketMatch, setTicketMatch] = useState<MatchItem | null>(null);
  const [multiTicketIds, setMultiTicketIds] = useState<string[]>(['']);
  const matches = useMemo(() => loadMatchScheduleSync(), []);
  const matchId = (m: MatchItem) => `${m.date}|${m.city}|${m.match}`;
  const matchMap = useMemo(() => {
    const map = new Map<string, MatchItem>();
    matches.forEach((m) => map.set(matchId(m), m));
    return map;
  }, [matches]);
  const focusChoices = [
    { key: 'fanfest', label: t('steps.interests.focusOptions.fanfest') },
    { key: 'local_culture', label: t('steps.interests.focusOptions.local_culture') },
    { key: 'stadium_experience', label: t('steps.interests.focusOptions.stadium_experience') },
  ] as const;

  function toggleFocus(k: 'fanfest'|'local_culture'|'stadium_experience') {
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
  const heading = fromMembership ? t('titleMembership') : t('titleDefault');
  const inputClass = 'w-full rounded-2xl border-2 border-white/60 bg-white/80 px-4 py-3 text-gray-900 focus:border-[color:var(--primary-color)] focus:ring-4 focus:ring-[color:var(--primary-color)]/10 outline-none transition';

  async function submitProfile() {
    setLoading(true);
    setError(null);
    try {
      const ticketSelections: MatchItem[] = [];
      if (hasTickets) {
        if (ticketEntryMode === 'single' && ticketMatch) {
          ticketSelections.push(ticketMatch);
        } else if (ticketEntryMode === 'multi') {
          multiTicketIds.forEach((id) => {
            const found = id ? matchMap.get(id) : null;
            if (found) ticketSelections.push(found);
          });
        }
      }

      const primaryTicket = ticketSelections[0] || ticketMatch || null;

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
        ticket_match: hasTickets && primaryTicket ? {
          country: primaryTicket.country,
          city: primaryTicket.city,
          stadium: primaryTicket.stadium,
          date: primaryTicket.date,
          match: primaryTicket.match,
        } : undefined,
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = res.status === 204 ? null : await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed to save profile');
      // Persist additional match context locally for Trip Builder bridge
      try {
        if (ticketSelections.length) {
          window.localStorage.setItem('fz_onboarding_ticket_matches', JSON.stringify(ticketSelections));
        } else {
          window.localStorage.removeItem('fz_onboarding_ticket_matches');
        }
      } catch {}

      // Mark onboarding complete (sets cookie)
      try {
        await fetch(`/api/onboarding/complete${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`, { method: 'POST' });
      } catch {}
      trackEvent('onboarding_completed', {
        source: fromMembership ? 'membership' : 'organic',
        budget_level: budgetLevel,
        preferred_transport: transport,
        climate_preference: climate,
        has_children_0_5: children05 > 0,
        has_children_6_18: children618 > 0,
        has_tickets: hasTickets,
        group_size: groupSize,
      });
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  const disabledNext1 = !homeAirport || (hasTickets && (ticketEntryMode === 'single' ? !ticketMatch : multiTicketIds.filter(Boolean).length === 0));

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,255,255,0.65))]"
      style={{ backgroundImage: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(255,255,255,0.4) 55%, var(--secondary-color) 120%)' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center text-white drop-shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">World Cup travel profile</p>
          <h1 className="text-4xl font-black">{heading}</h1>
          <p className="text-sm text-white/80 mt-2">{t('subtitle')}</p>
        </div>

        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Progress */}
          <div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))' }} />
            </div>
            <div className="text-xs text-gray-700 mt-1">{t('progress', { step: Math.min(step, 3) })}</div>
          </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-700">Step 1</p>
            <h2 className="text-2xl font-semibold text-gray-900">{t('steps.basics.title')}</h2>
            <p className="text-sm text-gray-600">Let's lock in your home base and traveler count so every plan starts with the right context.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">{t('steps.basics.homeAirportLabel')}</label>
            <AirportAutocomplete
              value={homeAirportInput}
              onChange={(value, ap) => {
                setHomeAirportInput(value);
                setHomeAirport(ap);
              }}
              placeholder={t('steps.basics.homeAirportPlaceholder')}
              autoFocus
            />
            <p className="text-xs text-gray-600">{t('steps.basics.homeAirportHelp')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.basics.adults')}
              <input type="number" min={1} value={groupSize} onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value || '1', 10)))} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.basics.children05')}
              <input type="number" min={0} value={children05} onChange={(e) => setChildren05(Math.max(0, parseInt(e.target.value || '0', 10)))} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.basics.seniors')}
              <input type="number" min={0} value={seniors} onChange={(e) => setSeniors(Math.max(0, parseInt(e.target.value || '0', 10)))} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.basics.children618')}
              <input type="number" min={0} value={children618} onChange={(e) => setChildren618(Math.max(0, parseInt(e.target.value || '0', 10)))} className={inputClass} />
            </label>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
            <input
              id="mobility"
              type="checkbox"
              checked={mobility}
              onChange={(e) => setMobility(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[color:var(--primary-color)] focus:ring-[color:var(--primary-color)]"
            />
            <label htmlFor="mobility" className="text-sm text-gray-700">{t('steps.basics.mobility')}</label>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Already have match tickets?</p>
                <p className="text-xs text-gray-600">Tell us where you'll be so we auto-align itineraries.</p>
              </div>
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${hasTickets ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => { setHasTickets(true); }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${!hasTickets ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => { setHasTickets(false); setTicketEntryMode('single'); setTicketMatch(null); setMultiTicketIds(['']); }}
                >
                  Not yet
                </button>
              </div>
            </div>

            {hasTickets && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-700">
                  <span>How many different matches do you already have tickets for?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`px-4 py-1 rounded-full border ${ticketEntryMode === 'single' ? 'bg-[color:var(--primary-color)] text-white border-transparent' : 'border-gray-300 text-gray-700'}`}
                      onClick={() => setTicketEntryMode('single')}
                    >
                      Just one
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-1 rounded-full border ${ticketEntryMode === 'multi' ? 'bg-[color:var(--primary-color)] text-white border-transparent' : 'border-gray-300 text-gray-700'}`}
                      onClick={() => setTicketEntryMode('multi')}
                    >
                      Multiple cities
                    </button>
                  </div>
                </div>

                {ticketEntryMode === 'single' ? (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Which match?</label>
                    <select
                      className={inputClass}
                      value={ticketMatch ? matchId(ticketMatch) : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        const found = matchMap.get(v) || null;
                        setTicketMatch(found);
                      }}
                    >
                      <option value="">Select a match…</option>
                      {matches.map((m) => (
                        <option key={matchId(m)} value={matchId(m)}>
                          {m.date} — {m.city} — {m.match} ({m.stadium})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {multiTicketIds.map((value, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <select
                          className={`${inputClass} flex-1`}
                          value={value}
                          onChange={(e) => {
                            const next = [...multiTicketIds];
                            next[idx] = e.target.value;
                            setMultiTicketIds(next);
                          }}
                        >
                          <option value="">Select a match…</option>
                          {matches.map((m) => (
                            <option key={matchId(m)} value={matchId(m)}>
                              {m.date} — {m.city} — {m.match}
                            </option>
                          ))}
                        </select>
                        {multiTicketIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMultiTicketIds((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-sm text-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMultiTicketIds((prev) => [...prev, ''])}
                      className="text-sm font-semibold text-[color:var(--primary-color)]"
                      disabled={multiTicketIds.length >= 3}
                    >
                      Add another match
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row-reverse justify-between gap-3">
            <button className={`px-6 py-3 rounded-full font-semibold text-white shadow ${disabledNext1 ? 'bg-gray-400 cursor-not-allowed' : ''}`} style={!disabledNext1 ? { background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))' } : {}} onClick={() => !disabledNext1 && setStep(2)} disabled={disabledNext1}>
              {t('buttons.next')}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-700">Step 2</p>
            <h2 className="text-2xl font-semibold text-gray-900">{t('steps.style.title')}</h2>
            <p className="text-sm text-gray-600">{t('steps.style.description')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.style.budget')}
              <select className={`${inputClass} appearance-none`} value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value as any)}>
                <option value="budget">{t('steps.style.budgetOptions.budget')}</option>
                <option value="moderate">{t('steps.style.budgetOptions.moderate')}</option>
                <option value="premium">{t('steps.style.budgetOptions.premium')}</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.style.food')}
              <select className={`${inputClass} appearance-none`} value={food} onChange={(e) => setFood(e.target.value as any)}>
                <option value="local_flavors">{t('steps.style.foodOptions.local_flavors')}</option>
                <option value="international">{t('steps.style.foodOptions.international')}</option>
                <option value="mix">{t('steps.style.foodOptions.mix')}</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.style.nightlife')}
              <select className={`${inputClass} appearance-none`} value={nightlife} onChange={(e) => setNightlife(e.target.value as any)}>
                <option value="quiet">{t('steps.style.nightlifeOptions.quiet')}</option>
                <option value="social">{t('steps.style.nightlifeOptions.social')}</option>
                <option value="party">{t('steps.style.nightlifeOptions.party')}</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              {t('steps.style.climate')}
              <select className={`${inputClass} appearance-none`} value={climate} onChange={(e) => setClimate(e.target.value as any)}>
                <option value="all">{t('steps.style.climateOptions.all')}</option>
                <option value="prefer_northerly">{t('steps.style.climateOptions.prefer_northerly')}</option>
                <option value="comfortable">{t('steps.style.climateOptions.comfortable')}</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="px-5 py-3 rounded-full border font-semibold text-gray-700" onClick={() => setStep(1)}>{t('buttons.back')}</button>
            <button className="px-5 py-3 rounded-full font-semibold text-white" style={{ background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))' }} onClick={() => setStep(3)}>
              {t('buttons.next')}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-700">Step 3</p>
            <h2 className="text-2xl font-semibold text-gray-900">{t('steps.interests.title')}</h2>
            <p className="text-sm text-gray-600">{t('steps.interests.description')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {focusChoices.map((it) => (
              <button
                key={it.key}
                type="button"
                onClick={() => toggleFocus(it.key as any)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${focus.includes(it.key as any) ? 'border-[color:var(--primary-color)] bg-[color:var(--primary-color)]/10 text-[color:var(--primary-color)] font-semibold' : 'border-gray-200 text-gray-700'}`}
              >
                {it.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('steps.interests.transport')}</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { key: 'public', title: 'Transit-first', desc: 'Metro, rail, rideshare ok' },
                { key: 'mixed', title: 'Mixed', desc: 'Use what’s easiest per city' },
                { key: 'car', title: 'Car / rental', desc: 'Prefer driving yourself' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTransport(opt.key as any)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${transport === opt.key ? 'border-[color:var(--primary-color)] bg-[color:var(--primary-color)]/10 text-[color:var(--primary-color)] font-semibold' : 'border-gray-200 text-gray-700'}`}
                >
                  <span className="block">{opt.title}</span>
                  <span className="text-xs text-gray-600">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('steps.interests.favoriteTeam')}</label>
            <input
              list="team-favorites"
              className={inputClass}
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              placeholder={t('steps.interests.favoriteTeamPlaceholder')}
            />
            <datalist id="team-favorites">
              {Object.keys(teamColors).map((team) => (
                <option key={team} value={team} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button className="px-5 py-3 rounded-full border font-semibold text-gray-700" onClick={() => setStep(2)}>{t('buttons.back')}</button>
            <button className="px-5 py-3 rounded-full font-semibold text-white" style={{ background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))' }} onClick={submitProfile} disabled={loading}>
              {loading ? t('buttons.saving') : t('buttons.finish')}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">{t('done.title')}</h2>
          <p className="text-sm text-gray-600">{t('done.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={redirectTarget || '/planner/trip-builder'} className="px-5 py-3 rounded-full bg-[color:var(--primary-color)] text-white font-semibold shadow">
              {redirectTarget ? t('done.ctaContinue') : t('done.ctaTripBuilder')}
            </a>
            <a href="/account/profile" className="px-5 py-3 rounded-full border font-semibold text-gray-700 hover:bg-gray-50">{t('done.ctaEdit')}</a>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
