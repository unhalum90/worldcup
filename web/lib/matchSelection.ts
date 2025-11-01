const MATCH_KEY_DELIMITER = '::';

function normalizeCitySegment(city?: string | null): string {
  return (city || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function createMatchKey(city: string | null | undefined, date: string | null | undefined): string | null {
  if (!date) return null;
  const citySegment = normalizeCitySegment(city);
  return `${citySegment}${MATCH_KEY_DELIMITER}${date}`;
}

export function parseMatchKey(key: string): { citySegment: string; date: string } {
  const [citySegment, date] = key.split(MATCH_KEY_DELIMITER);
  return {
    citySegment: citySegment || '',
    date: date || '',
  };
}

export function extractDateFromMatchKey(key: string): string {
  return parseMatchKey(key).date || key;
}

export function matchKeyEquals(key: string, city: string | null | undefined, date: string | null | undefined): boolean {
  const target = createMatchKey(city, date);
  return Boolean(target) && key === target;
}

export function sortMatchKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => extractDateFromMatchKey(a).localeCompare(extractDateFromMatchKey(b)));
}
