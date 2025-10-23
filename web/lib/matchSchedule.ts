export type MatchItem = {
  country: string;
  city: string;
  stadium: string;
  date: string; // ISO: 2026-06-14
  displayDate: string; // Original like "Jun 14 (Sun)"
  match: string; // e.g., "Match 11 Group F"
};

const CITY_NAME_MAP: Record<string, string> = {
  'New York / New Jersey': 'New York',
  'San Francisco Bay Area': 'San Francisco Bay Area',
  'Mexico City': 'Mexico City',
  'Guadalajara': 'Guadalajara',
  'Monterrey': 'Monterrey',
  'Toronto': 'Toronto',
  'Vancouver': 'Vancouver',
  'Atlanta': 'Atlanta',
  'Boston': 'Boston',
  'Dallas': 'Dallas',
  'Houston': 'Houston',
  'Kansas City': 'Kansas City',
  'Los Angeles': 'Los Angeles',
  'Miami': 'Miami',
  'Philadelphia': 'Philadelphia',
  'Seattle': 'Seattle',
};

const MONTHS: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

export function normalizeCityAndStadium(label: string): { city: string; stadium: string } {
  // Split on en dash or hyphen
  const parts = label.split(' – ');
  const cityRaw = (parts[0] || '').trim();
  const stadium = (parts[1] || '').trim();
  const cityBase = CITY_NAME_MAP[cityRaw] || cityRaw;
  return { city: cityBase, stadium };
}

export function normalizeDateToISO(dateStr: string): string | null {
  // Example: "Jun 14 (Sun)" or "Jul 19 (Sun)"
  const m = dateStr.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return null;
  const mon = MONTHS[m[1]];
  const day = m[2].padStart(2, '0');
  if (!mon) return null;
  return `2026-${mon}-${day}`;
}

// New approach: import a pre-normalized schedule that ships with the app (no fs).
import { MATCH_SCHEDULE } from './scheduleData';

export function loadMatchScheduleSync(): MatchItem[] {
  return MATCH_SCHEDULE.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function filterMatches(params: {
  cities?: string[];
  startDate?: string;
  endDate?: string;
}): MatchItem[] {
  const { cities, startDate, endDate } = params;
  const all = loadMatchScheduleSync();
  return all.filter((m) => {
    const byCity = !cities || cities.length === 0 || cities.includes(m.city);
    const afterStart = !startDate || m.date >= startDate;
    const beforeEnd = !endDate || m.date <= endDate;
    return byCity && afterStart && beforeEnd;
  });
}

export function groupByCity(matches: MatchItem[]): Record<string, MatchItem[]> {
  return matches.reduce<Record<string, MatchItem[]>>((acc, m) => {
    (acc[m.city] ||= []).push(m);
    return acc;
  }, {});
}
