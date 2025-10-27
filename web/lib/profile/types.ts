import type { Airport } from '@/lib/airportData';

export type BudgetLevel = 'budget' | 'moderate' | 'premium';
export type FoodPreference = 'local_flavors' | 'international' | 'mix';
export type NightlifePreference = 'quiet' | 'social' | 'party';
export type ClimatePreference = 'all' | 'prefer_northerly' | 'comfortable';
export type PreferredTransport = 'public' | 'car' | 'mixed';
export type TravelFocus = 'fanfest' | 'local_culture' | 'stadium_experience' | 'nightlife';

export type HomeAirport = Pick<Airport, 'code' | 'name' | 'city' | 'country'>;

export interface UserProfile {
  id?: string;
  user_id?: string;
  home_city?: string | null;
  home_airport: HomeAirport | null;
  group_size?: number;
  children?: number; // legacy aggregate (server may compute)
  children_0_5?: number;
  children_6_18?: number;
  seniors?: number;
  mobility_issues?: boolean;
  budget_level?: BudgetLevel | null;
  food_preference?: FoodPreference | null;
  nightlife_preference?: NightlifePreference | null;
  climate_preference?: ClimatePreference | null;
  travel_focus?: TravelFocus[] | null;
  preferred_transport?: PreferredTransport | null;
  languages?: string[] | null;
  currency?: string | null;
  favorite_team?: string | null;
  has_tickets?: boolean | null;
  ticket_match?: {
    country: string;
    city: string;
    stadium: string;
    date: string; // ISO 2026-06-14
    match: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export function normalizeIata(code: string | undefined): string | null {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : null;
}

export function validateProfileInput(body: any): { ok: true; value: Partial<UserProfile> } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid JSON' };
  const out: Partial<UserProfile> = {};

  // Home airport required for onboarding
  const ha = body.home_airport;
  if (ha) {
    const code = normalizeIata(ha.code || ha.iata);
    if (!code) return { ok: false, error: 'home_airport.code must be a 3-letter IATA' };
    out.home_airport = {
      code,
      name: String(ha.name || '').slice(0, 200) || code,
      city: String(ha.city || '').slice(0, 120) || '',
      country: String(ha.country || '').slice(0, 3) || '',
    };
  }

  const ints = ['group_size', 'children', 'children_0_5', 'children_6_18', 'seniors'] as const;
  for (const k of ints) {
    if (body[k] !== undefined) {
      const n = Number(body[k]);
      if (!Number.isFinite(n) || n < 0) return { ok: false, error: `${k} must be a non-negative number` };
      (out as any)[k] = k === 'group_size' ? Math.max(1, Math.floor(n)) : Math.floor(n);
    }
  }

  if (body.mobility_issues !== undefined) out.mobility_issues = Boolean(body.mobility_issues);

  const enums: [keyof UserProfile, string[]][] = [
    ['budget_level', ['budget', 'moderate', 'premium']],
    ['food_preference', ['local_flavors', 'international', 'mix']],
    ['nightlife_preference', ['quiet', 'social', 'party']],
    ['climate_preference', ['all', 'prefer_northerly', 'comfortable']],
    ['preferred_transport', ['public', 'car', 'mixed']],
  ];
  for (const [k, allowed] of enums) {
    if (body[k] !== undefined && body[k] !== null) {
      const v = String(body[k]);
      if (!allowed.includes(v)) return { ok: false, error: `${String(k)} must be one of ${allowed.join(', ')}` };
      (out as any)[k] = v;
    }
  }

  if (Array.isArray(body.travel_focus)) {
    const allowed: TravelFocus[] = ['fanfest', 'local_culture', 'stadium_experience', 'nightlife'];
    const arr = body.travel_focus.filter((x: any) => allowed.includes(x));
    out.travel_focus = arr;
  }

  if (body.home_city !== undefined) out.home_city = String(body.home_city || '');
  if (Array.isArray(body.languages)) out.languages = body.languages.map(String);
  if (body.currency !== undefined) out.currency = String(body.currency || '');
  if (body.favorite_team !== undefined) out.favorite_team = String(body.favorite_team || '');

  if (body.has_tickets !== undefined) out.has_tickets = Boolean(body.has_tickets);
  if (body.ticket_match && typeof body.ticket_match === 'object') {
    const m = body.ticket_match;
    const country = String(m.country || '').slice(0, 56);
    const city = String(m.city || '').slice(0, 56);
    const stadium = String(m.stadium || '').slice(0, 120);
    const date = String(m.date || '');
    const match = String(m.match || '').slice(0, 80);
    if (!date || !/^(?:2026)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(date)) {
      return { ok: false, error: 'ticket_match.date must be ISO YYYY-MM-DD in 2026' };
    }
    out.ticket_match = { country, city, stadium, date, match } as any;
  }

  return { ok: true, value: out };
}
