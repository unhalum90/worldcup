export function countryTextToCode(country?: string | null): 'us' | 'ca' | 'mx' | undefined {
  if (!country) return undefined
  const c = country.trim().toLowerCase()
  if (c.includes('united states') || c === 'usa' || c === 'us') return 'us'
  if (c.includes('canada') || c === 'can') return 'ca'
  if (c.includes('mexico') || c === 'mex') return 'mx'
  return undefined
}

