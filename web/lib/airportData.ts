// Airport autocomplete data - filtered to major airports with IATA codes
// Parsed from airports.csv, focusing on scheduled service airports

export interface Airport {
  code: string; // IATA code (e.g., "LIS")
  name: string; // Airport name
  city: string; // Municipality
  country: string; // ISO country code
}

// This will be populated from the CSV - for now, here are major airports
// In production, you'd parse the full CSV server-side or use a search API
export const MAJOR_AIRPORTS: Airport[] = [
  // Europe
  { code: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'PT' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'GB' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'FR' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'FR' },
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'ES' },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'ES' },
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'IT' },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'IT' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'DE' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'NL' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'BE' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'AT' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'CH' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'DK' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'NO' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'SE' },
  { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'FI' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'IE' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'GR' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR' },
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'PL' },
  { code: 'PRG', name: 'Prague Vaclav Havel', city: 'Prague', country: 'CZ' },
  
  // North America (non-host cities)
  { code: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'US' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'US' },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', country: 'US' },
  { code: 'LAS', name: 'Las Vegas McCarran', city: 'Las Vegas', country: 'US' },
  { code: 'MSP', name: 'Minneapolis-St Paul', city: 'Minneapolis', country: 'US' },
  { code: 'DTW', name: 'Detroit Metro', city: 'Detroit', country: 'US' },
  { code: 'CLT', name: 'Charlotte Douglas', city: 'Charlotte', country: 'US' },
  { code: 'YUL', name: 'Montreal Trudeau', city: 'Montreal', country: 'CA' },
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'CA' },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'CA' },
  
  // South America
  { code: 'GRU', name: 'São Paulo Guarulhos', city: 'São Paulo', country: 'BR' },
  { code: 'GIG', name: 'Rio de Janeiro Galeão', city: 'Rio de Janeiro', country: 'BR' },
  { code: 'EZE', name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'AR' },
  { code: 'BOG', name: 'Bogotá El Dorado', city: 'Bogotá', country: 'CO' },
  { code: 'LIM', name: 'Lima Jorge Chavez', city: 'Lima', country: 'PE' },
  { code: 'SCL', name: 'Santiago Arturo Merino', city: 'Santiago', country: 'CL' },
  
  // Asia
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'JP' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'JP' },
  { code: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'KR' },
  { code: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'CN' },
  { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'CN' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'HK' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'SG' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'TH' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'MY' },
  { code: 'DEL', name: 'Delhi Indira Gandhi', city: 'New Delhi', country: 'IN' },
  { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji', city: 'Mumbai', country: 'IN' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'AE' },
  { code: 'DOH', name: 'Doha Hamad International', city: 'Doha', country: 'QA' },
  
  // Africa
  { code: 'JNB', name: 'Johannesburg O.R. Tambo', city: 'Johannesburg', country: 'ZA' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'ZA' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'EG' },
  { code: 'ADD', name: 'Addis Ababa Bole', city: 'Addis Ababa', country: 'ET' },
  { code: 'NBO', name: 'Nairobi Jomo Kenyatta', city: 'Nairobi', country: 'KE' },
  { code: 'LOS', name: 'Lagos Murtala Muhammed', city: 'Lagos', country: 'NG' },
  
  // Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU' },
  { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'AU' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'NZ' },
  
  // World Cup 2026 Host Cities (from our database)
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'US' },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'US' },
  { code: 'IAH', name: 'Houston George Bush', city: 'Houston', country: 'US' },
  { code: 'ATL', name: 'Atlanta Hartsfield-Jackson', city: 'Atlanta', country: 'US' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'US' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'US' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'US' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'US' },
  { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'US' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'New York', country: 'US' },
  { code: 'JFK', name: 'New York JFK', city: 'New York', country: 'US' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'US' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'CA' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'CA' },
  { code: 'GDL', name: 'Guadalajara International', city: 'Guadalajara', country: 'MX' },
  { code: 'MTY', name: 'Monterrey International', city: 'Monterrey', country: 'MX' },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'MX' },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return MAJOR_AIRPORTS.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results
}

export function formatAirportDisplay(airport: Airport): string {
  return `${airport.city} (${airport.code}) - ${airport.name}`;
}
