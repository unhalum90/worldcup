// Comprehensive city data for all 16 World Cup 2026 host cities
// Combines venue, airport, fan fest, and lodging zone information

export interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface FanFest {
  name: string;
  lat: number;
  lng: number;
}

export interface LodgingZone {
  name: string;
  lat: number;
  lng: number;
  tier: 'luxury' | 'midrange' | 'budget';
  priceRange: string;
  description: string;
}

export interface CityData {
  city: string;
  citySlug: string;
  country: 'USA' | 'Mexico' | 'Canada';
  stadium: string;
  stadiumLat: number;
  stadiumLng: number;
  capacity: number;
  transit: 'EXCELLENT' | 'GOOD' | 'LIMITED' | 'NONE';
  transitNote: string;
  altitude?: number; // meters, for Mexico City
  airport: Airport;
  fanFest: FanFest | null;
  lodgingZones: LodgingZone[];
  weatherNote: string;
  safetyTips: string[];
}

export const cityData: CityData[] = [
  {
    city: "Mexico City",
    citySlug: "mexico-city",
    country: "Mexico",
    stadium: "Estadio Azteca",
    stadiumLat: 19.3029,
    stadiumLng: -99.1505,
    capacity: 87523,
    transit: "GOOD",
    transitNote: "Metro Line 2 to Tasqueña, then light rail to Estadio Azteca station. 45 min from Centro.",
    altitude: 2240,
    airport: { code: "MEX", name: "Benito Juárez International", lat: 19.4361, lng: -99.0719 },
    fanFest: { name: "Zócalo (Plaza de la Constitución)", lat: 19.4326, lng: -99.1332 },
    lodgingZones: [
      { name: "Polanco", lat: 19.4328, lng: -99.1936, tier: "luxury", priceRange: "$200-500+", description: "Upscale shopping & dining" },
      { name: "Roma Norte", lat: 19.4195, lng: -99.1619, tier: "luxury", priceRange: "$150-400", description: "Trendy nightlife scene" },
      { name: "Condesa", lat: 19.4115, lng: -99.1735, tier: "midrange", priceRange: "$120-300", description: "Hip cafes & parks" },
      { name: "Coyoacán", lat: 19.3500, lng: -99.1620, tier: "midrange", priceRange: "$100-250", description: "Historic & bohemian" },
      { name: "Centro Histórico", lat: 19.4326, lng: -99.1332, tier: "budget", priceRange: "$80-200", description: "Near landmarks" },
    ],
    weatherNote: "June is rainy season. Highs 24-26°C (75-79°F). Afternoon showers common. High altitude affects acclimatization.",
    safetyTips: ["Use Uber/DiDi or official taxis", "Avoid unmarked cabs", "Watch for pickpockets in Metro", "Safest areas: Polanco, Condesa, Roma Norte"],
  },
  {
    city: "Guadalajara",
    citySlug: "guadalajara",
    country: "Mexico",
    stadium: "Estadio Akron",
    stadiumLat: 20.5993,
    stadiumLng: -103.4457,
    capacity: 49850,
    transit: "LIMITED",
    transitNote: "No direct rail. Rideshare or event shuttles from downtown. 30-40 min drive.",
    airport: { code: "GDL", name: "Miguel Hidalgo y Costilla International", lat: 20.5218, lng: -103.3111 },
    fanFest: { name: "Plaza de la Liberación", lat: 20.6767, lng: -103.3476 },
    lodgingZones: [
      { name: "Providencia", lat: 20.6939, lng: -103.4108, tier: "luxury", priceRange: "$150-350", description: "Upscale dining & shopping" },
      { name: "Centro Histórico", lat: 20.6767, lng: -103.3476, tier: "midrange", priceRange: "$80-200", description: "Historic architecture" },
      { name: "Zapopan", lat: 20.7205, lng: -103.3869, tier: "budget", priceRange: "$60-150", description: "Local neighborhoods" },
    ],
    weatherNote: "June highs around 30°C (86°F). Occasional afternoon rain. Pleasant evenings.",
    safetyTips: ["Use registered taxis or Uber", "Tourist areas are generally safe", "Avoid displaying expensive items"],
  },
  {
    city: "Monterrey",
    citySlug: "monterrey",
    country: "Mexico",
    stadium: "Estadio BBVA",
    stadiumLat: 25.6487,
    stadiumLng: -100.2865,
    capacity: 53500,
    transit: "GOOD",
    transitNote: "Metro Line 1 to Talleres, then shuttle or walk 20 min. Event-day shuttles expected.",
    airport: { code: "MTY", name: "Mariano Escobedo International", lat: 25.7785, lng: -100.1069 },
    fanFest: { name: "Parque Fundidora", lat: 25.6827, lng: -100.2930 },
    lodgingZones: [
      { name: "San Pedro Garza García", lat: 25.6572, lng: -100.4024, tier: "luxury", priceRange: "$150-400", description: "Upscale suburb" },
      { name: "Centro", lat: 25.6714, lng: -100.3093, tier: "midrange", priceRange: "$80-200", description: "Near Macroplaza" },
      { name: "Fundidora Area", lat: 25.6827, lng: -100.2930, tier: "budget", priceRange: "$60-150", description: "Near stadium & park" },
    ],
    weatherNote: "Hot! June highs 35°C+ (95°F+). Stay hydrated. Dry heat.",
    safetyTips: ["Stick to tourist areas", "Use Uber/DiDi", "Stay aware in crowded areas"],
  },
  {
    city: "Atlanta",
    citySlug: "atlanta",
    country: "USA",
    stadium: "Mercedes-Benz Stadium",
    stadiumLat: 33.7554,
    stadiumLng: -84.4008,
    capacity: 71000,
    transit: "EXCELLENT",
    transitNote: "MARTA rail to Dome/GWCC/Philips Arena station, 5 min walk to stadium.",
    airport: { code: "ATL", name: "Hartsfield-Jackson Atlanta International", lat: 33.6407, lng: -84.4277 },
    fanFest: { name: "Centennial Olympic Park", lat: 33.7600, lng: -84.3932 },
    lodgingZones: [
      { name: "Buckhead", lat: 33.8381, lng: -84.3799, tier: "luxury", priceRange: "$200-500+", description: "Upscale shopping district" },
      { name: "Midtown", lat: 33.7835, lng: -84.3833, tier: "midrange", priceRange: "$150-300", description: "Arts & culture hub" },
      { name: "Downtown", lat: 33.7537, lng: -84.3863, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Hot & humid. June highs 32°C (90°F). Thunderstorms possible.",
    safetyTips: ["MARTA is safe during events", "Stay in well-lit areas at night", "Downtown is busy on game days"],
  },
  {
    city: "Toronto",
    citySlug: "toronto",
    country: "Canada",
    stadium: "BMO Field",
    stadiumLat: 43.6336,
    stadiumLng: -79.4181,
    capacity: 45500,
    transit: "EXCELLENT",
    transitNote: "Streetcar 509 or 511 from Union Station. 15 min to Exhibition Place.",
    airport: { code: "YYZ", name: "Toronto Pearson International", lat: 43.6777, lng: -79.6248 },
    fanFest: { name: "Fort York & The Bentway", lat: 43.6386, lng: -79.3950 },
    lodgingZones: [
      { name: "Yorkville", lat: 43.6709, lng: -79.3932, tier: "luxury", priceRange: "$250-600 CAD", description: "Designer shopping" },
      { name: "Entertainment District", lat: 43.6465, lng: -79.3882, tier: "midrange", priceRange: "$150-350 CAD", description: "Near CN Tower" },
      { name: "Queen West", lat: 43.6484, lng: -79.4113, tier: "budget", priceRange: "$100-250 CAD", description: "Trendy & artsy" },
    ],
    weatherNote: "Pleasant June. Highs 24-27°C (75-80°F). Occasional rain.",
    safetyTips: ["Very safe city", "TTC is reliable", "Beware ticket scalpers near venue"],
  },
  {
    city: "Vancouver",
    citySlug: "vancouver",
    country: "Canada",
    stadium: "BC Place",
    stadiumLat: 49.2768,
    stadiumLng: -123.1120,
    capacity: 54500,
    transit: "EXCELLENT",
    transitNote: "SkyTrain to Stadium-Chinatown station, steps from the venue.",
    airport: { code: "YVR", name: "Vancouver International", lat: 49.1967, lng: -123.1815 },
    fanFest: { name: "Hastings Park (PNE Grounds)", lat: 49.2706, lng: -123.1036 },
    lodgingZones: [
      { name: "Coal Harbour", lat: 49.2905, lng: -123.1225, tier: "luxury", priceRange: "$300-600 CAD", description: "Waterfront luxury" },
      { name: "Yaletown", lat: 49.2745, lng: -123.1210, tier: "midrange", priceRange: "$200-400 CAD", description: "Trendy restaurants" },
      { name: "Gastown", lat: 49.2834, lng: -123.1066, tier: "budget", priceRange: "$120-250 CAD", description: "Historic district" },
    ],
    weatherNote: "Mild June. Highs 19-22°C (66-72°F). Bring layers for evenings.",
    safetyTips: ["Very safe city", "Avoid East Hastings late at night", "SkyTrain is efficient"],
  },
  {
    city: "Seattle",
    citySlug: "seattle",
    country: "USA",
    stadium: "Lumen Field",
    stadiumLat: 47.5952,
    stadiumLng: -122.3316,
    capacity: 69000,
    transit: "EXCELLENT",
    transitNote: "Link Light Rail to Stadium station, 2 min walk.",
    airport: { code: "SEA", name: "Seattle-Tacoma International", lat: 47.4502, lng: -122.3088 },
    fanFest: { name: "Seattle Center", lat: 47.6205, lng: -122.3493 },
    lodgingZones: [
      { name: "Downtown/Waterfront", lat: 47.6062, lng: -122.3384, tier: "luxury", priceRange: "$250-500", description: "Pike Place area" },
      { name: "Capitol Hill", lat: 47.6253, lng: -122.3222, tier: "midrange", priceRange: "$150-300", description: "Nightlife & dining" },
      { name: "Pioneer Square", lat: 47.6015, lng: -122.3343, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Pleasant June. Highs 20-24°C (68-75°F). Rain unlikely but bring layers.",
    safetyTips: ["Light Rail is safe", "Pioneer Square can be rough late night", "Downtown is walkable"],
  },
  {
    city: "Los Angeles",
    citySlug: "los-angeles",
    country: "USA",
    stadium: "SoFi Stadium",
    stadiumLat: 33.9535,
    stadiumLng: -118.3386,
    capacity: 70240,
    transit: "NONE",
    transitNote: "No rail to Inglewood; shuttles or rideshare required from downtown LA.",
    airport: { code: "LAX", name: "Los Angeles International", lat: 33.9416, lng: -118.4085 },
    fanFest: { name: "Los Angeles Memorial Coliseum / Exposition Park", lat: 34.0131, lng: -118.2879 },
    lodgingZones: [
      { name: "Santa Monica", lat: 34.0195, lng: -118.4912, tier: "luxury", priceRange: "$300-600", description: "Beach & boardwalk" },
      { name: "Downtown LA", lat: 34.0407, lng: -118.2468, tier: "midrange", priceRange: "$150-350", description: "Arts District & DTLA" },
      { name: "Inglewood", lat: 33.9617, lng: -118.3531, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Sunny June. Highs 24-28°C (75-82°F). Low humidity.",
    safetyTips: ["Plan transportation early", "Traffic is notorious", "Rideshare surge pricing on game days"],
  },
  {
    city: "San Francisco Bay Area",
    citySlug: "san-francisco",
    country: "USA",
    stadium: "Levi's Stadium",
    stadiumLat: 37.4030,
    stadiumLng: -121.9692,
    capacity: 71000,
    transit: "LIMITED",
    transitNote: "VTA Light Rail to Great America station, 10 min walk. 45 min from SF on Caltrain + VTA.",
    airport: { code: "SFO", name: "San Francisco International", lat: 37.6213, lng: -122.3790 },
    fanFest: null, // TBD
    lodgingZones: [
      { name: "San Francisco Downtown", lat: 37.7879, lng: -122.4074, tier: "luxury", priceRange: "$300-600", description: "Union Square area" },
      { name: "San Jose Downtown", lat: 37.3382, lng: -121.8863, tier: "midrange", priceRange: "$150-300", description: "Near stadium" },
      { name: "Santa Clara", lat: 37.3541, lng: -121.9552, tier: "budget", priceRange: "$120-250", description: "Walking distance" },
    ],
    weatherNote: "Cool June. SF highs 18-21°C (64-70°F). Santa Clara warmer. Bring layers.",
    safetyTips: ["Stadium is in Santa Clara, not SF", "Plan 1+ hour travel from SF", "VTA is reliable on game days"],
  },
  {
    city: "Boston",
    citySlug: "boston",
    country: "USA",
    stadium: "Gillette Stadium",
    stadiumLat: 42.0909,
    stadiumLng: -71.2643,
    capacity: 65878,
    transit: "LIMITED",
    transitNote: "Commuter Rail from South Station + event shuttle. 60-75 min from Boston.",
    airport: { code: "BOS", name: "Logan International", lat: 42.3656, lng: -71.0096 },
    fanFest: null, // TBD
    lodgingZones: [
      { name: "Back Bay", lat: 42.3503, lng: -71.0810, tier: "luxury", priceRange: "$300-600", description: "Historic brownstones" },
      { name: "Seaport", lat: 42.3519, lng: -71.0446, tier: "midrange", priceRange: "$200-400", description: "Modern waterfront" },
      { name: "Foxborough", lat: 42.0654, lng: -71.2481, tier: "budget", priceRange: "$150-300", description: "Near stadium" },
    ],
    weatherNote: "Pleasant June. Highs 24-27°C (75-80°F). Occasional humidity.",
    safetyTips: ["Stadium is 30 miles from Boston", "Book Foxborough hotel for convenience", "Commuter rail fills up fast"],
  },
  {
    city: "New York/New Jersey",
    citySlug: "new-york",
    country: "USA",
    stadium: "MetLife Stadium",
    stadiumLat: 40.8135,
    stadiumLng: -74.0745,
    capacity: 82500,
    transit: "GOOD",
    transitNote: "NJ Transit from Penn Station to Secaucus, then event shuttle to Meadowlands.",
    airport: { code: "EWR", name: "Newark Liberty International", lat: 40.6895, lng: -74.1745 },
    fanFest: { name: "Liberty State Park", lat: 40.703693, lng: -74.052315 },
    lodgingZones: [
      { name: "Manhattan Midtown", lat: 40.7549, lng: -73.9840, tier: "luxury", priceRange: "$350-700", description: "Times Square & Broadway" },
      { name: "Jersey City", lat: 40.7178, lng: -74.0431, tier: "midrange", priceRange: "$150-300", description: "PATH to NYC" },
      { name: "Newark/Secaucus", lat: 40.7895, lng: -74.0565, tier: "budget", priceRange: "$120-250", description: "Near stadium" },
    ],
    weatherNote: "Warm & humid June. Highs 27-30°C (80-86°F). Thunderstorms possible.",
    safetyTips: ["Stadium is in NJ, not NYC", "NJ Transit gets crowded", "Stay alert in Penn Station"],
  },
  {
    city: "Miami",
    citySlug: "miami",
    country: "USA",
    stadium: "Hard Rock Stadium",
    stadiumLat: 25.9578,
    stadiumLng: -80.2389,
    capacity: 65326,
    transit: "LIMITED",
    transitNote: "20 mile drive from downtown with no fixed-route transit. Rideshare or event shuttles.",
    airport: { code: "MIA", name: "Miami International", lat: 25.7959, lng: -80.2870 },
    fanFest: { name: "Bayfront Park", lat: 25.7753, lng: -80.1855 },
    lodgingZones: [
      { name: "South Beach", lat: 25.7826, lng: -80.1341, tier: "luxury", priceRange: "$300-700", description: "Art Deco & nightlife" },
      { name: "Brickell", lat: 25.7617, lng: -80.1918, tier: "midrange", priceRange: "$200-400", description: "Urban downtown" },
      { name: "Miami Gardens", lat: 25.9420, lng: -80.2456, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Hot & humid June. Highs 32°C (90°F). Afternoon thunderstorms likely.",
    safetyTips: ["No rail to stadium", "Book rideshare early", "Stay hydrated - it's hot!"],
  },
  {
    city: "Philadelphia",
    citySlug: "philadelphia",
    country: "USA",
    stadium: "Lincoln Financial Field",
    stadiumLat: 39.9008,
    stadiumLng: -75.1675,
    capacity: 69796,
    transit: "EXCELLENT",
    transitNote: "SEPTA Broad Street Line to AT&T station, 5 min walk to stadium.",
    airport: { code: "PHL", name: "Philadelphia International", lat: 39.8729, lng: -75.2437 },
    fanFest: { name: "Lemon Hill – Fairmount Park", lat: 39.9831, lng: -75.1652 },
    lodgingZones: [
      { name: "Center City", lat: 39.9526, lng: -75.1652, tier: "luxury", priceRange: "$250-500", description: "Historic downtown" },
      { name: "Old City", lat: 39.9496, lng: -75.1426, tier: "midrange", priceRange: "$150-300", description: "Near Independence Hall" },
      { name: "South Philly", lat: 39.9252, lng: -75.1698, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Warm June. Highs 28-31°C (82-88°F). Humid with chance of rain.",
    safetyTips: ["Broad Street Line is easy", "Sports Complex area is safe on game days", "Walk in groups at night"],
  },
  {
    city: "Houston",
    citySlug: "houston",
    country: "USA",
    stadium: "NRG Stadium",
    stadiumLat: 29.6847,
    stadiumLng: -95.4107,
    capacity: 72220,
    transit: "GOOD",
    transitNote: "METRORail Red Line to NRG Park station. 25 min from downtown.",
    airport: { code: "IAH", name: "George Bush Intercontinental", lat: 29.9902, lng: -95.3368 },
    fanFest: { name: "East Downtown (EaDo)", lat: 29.7570, lng: -95.3554 },
    lodgingZones: [
      { name: "Galleria/Uptown", lat: 29.7604, lng: -95.4617, tier: "luxury", priceRange: "$200-450", description: "Shopping & dining" },
      { name: "Downtown", lat: 29.7604, lng: -95.3698, tier: "midrange", priceRange: "$150-300", description: "Near rail" },
      { name: "Medical Center/NRG", lat: 29.7066, lng: -95.4011, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Hot & humid! June highs 34°C (93°F). Thunderstorms common.",
    safetyTips: ["METRORail is convenient", "Stay hydrated", "AC everywhere - bring a light jacket indoors"],
  },
  {
    city: "Dallas",
    citySlug: "dallas",
    country: "USA",
    stadium: "AT&T Stadium",
    stadiumLat: 32.7473,
    stadiumLng: -97.0945,
    capacity: 80000,
    transit: "NONE",
    transitNote: "No direct rail to Arlington. TRE to CentrePort then shuttle, or rideshare 30-40 min.",
    airport: { code: "DFW", name: "Dallas/Fort Worth International", lat: 32.8998, lng: -97.0403 },
    fanFest: { name: "Fair Park", lat: 32.7792, lng: -96.7684 },
    lodgingZones: [
      { name: "Uptown Dallas", lat: 32.8018, lng: -96.8003, tier: "luxury", priceRange: "$250-500", description: "Trendy bars & restaurants" },
      { name: "Downtown Dallas", lat: 32.7767, lng: -96.7970, tier: "midrange", priceRange: "$150-300", description: "Arts District" },
      { name: "Arlington", lat: 32.7357, lng: -97.1081, tier: "budget", priceRange: "$100-200", description: "Near stadium" },
    ],
    weatherNote: "Hot! June highs 35°C (95°F). Sunny and dry.",
    safetyTips: ["Stadium is in Arlington, not Dallas", "No public transit to stadium", "Book transportation early"],
  },
  {
    city: "Kansas City",
    citySlug: "kansas-city",
    country: "USA",
    stadium: "Arrowhead Stadium",
    stadiumLat: 39.0489,
    stadiumLng: -94.4839,
    capacity: 76416,
    transit: "NONE",
    transitNote: "No rail service. 10 miles east of downtown; rideshare or drive with parking.",
    airport: { code: "MCI", name: "Kansas City International", lat: 39.2976, lng: -94.7139 },
    fanFest: { name: "National WWI Museum & Memorial Grounds", lat: 39.0909, lng: -94.5846 },
    lodgingZones: [
      { name: "Country Club Plaza", lat: 39.0425, lng: -94.5928, tier: "luxury", priceRange: "$200-400", description: "Spanish architecture" },
      { name: "Downtown/Power & Light", lat: 39.0997, lng: -94.5786, tier: "midrange", priceRange: "$150-300", description: "Entertainment district" },
      { name: "Independence", lat: 39.0911, lng: -94.4155, tier: "budget", priceRange: "$80-150", description: "Near stadium" },
    ],
    weatherNote: "Warm June. Highs 30-32°C (86-90°F). Thunderstorms possible.",
    safetyTips: ["No transit to stadium", "Tailgating is huge here", "Drive or rideshare only"],
  },
];

// Helper functions
export function getCityBySlug(slug: string): CityData | undefined {
  return cityData.find(c => c.citySlug === slug);
}

export function getCityByName(name: string): CityData | undefined {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return cityData.find(c => {
    const cityNorm = c.city.toLowerCase().replace(/[^a-z]/g, '');
    return cityNorm.includes(normalized) || normalized.includes(cityNorm);
  });
}

export function getCityByStadium(stadium: string): CityData | undefined {
  return cityData.find(c => c.stadium.toLowerCase() === stadium.toLowerCase());
}
