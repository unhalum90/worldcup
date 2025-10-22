export interface CityGuide {
  slug: string;
  name: string;
  country: string;
  countryCode: 'USA' | 'CAN' | 'MEX';
  stadium: string;
  capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  isAvailable: boolean;
  releaseDate?: string; // ISO date string
  downloadUrl?: string; // LemonSqueezy or PDF URL
  highlights: string[];
  transportation: {
    airport: string;
    airportCode: string;
    distanceToStadium: string;
    publicTransit: string;
  };
  lodging: {
    averageCost: string;
    recommendedAreas: string[];
  };
}

export const cityGuides: CityGuide[] = [
  {
    slug: 'dallas',
    name: 'Dallas',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'AT&T Stadium',
    capacity: 80000,
    coordinates: { lat: 32.7473, lng: -97.0945 },
    description: 'Experience World Cup 2026 in the heart of Texas at the iconic AT&T Stadium. Home to the Dallas Cowboys, this state-of-the-art venue features a massive retractable roof and one of the world\'s largest video boards.',
    isAvailable: true,
    downloadUrl: '/cityguides', // Links to existing Dallas guide
    highlights: [
      'World\'s largest HD video board',
      'Retractable roof stadium',
      'Deep Texas BBQ culture',
      'Major airline hub (DFW)',
      'Free DART rail to stadium area'
    ],
    transportation: {
      airport: 'Dallas/Fort Worth International Airport',
      airportCode: 'DFW',
      distanceToStadium: '18 miles',
      publicTransit: 'DART Light Rail (Green & Orange Lines) + TRE to Arlington'
    },
    lodging: {
      averageCost: '$150-300/night',
      recommendedAreas: ['Downtown Dallas', 'Arlington (near stadium)', 'Fort Worth', 'Grapevine']
    }
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Mercedes-Benz Stadium',
    capacity: 71000,
    coordinates: { lat: 33.7554, lng: -84.4008 },
    description: 'Atlanta\'s Mercedes-Benz Stadium is a modern architectural marvel featuring a unique retractable roof design. Located in the heart of downtown, it offers easy access to the city\'s vibrant culture and entertainment.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'LEED Platinum certified',
      'Retractable roof',
      'Downtown location',
      'Major airline hub (ATL)',
      'MARTA rail access'
    ],
    transportation: {
      airport: 'Hartsfield-Jackson Atlanta International Airport',
      airportCode: 'ATL',
      distanceToStadium: '10 miles',
      publicTransit: 'MARTA - Blue/Green Lines to Vine City or GWCC/CNN Center'
    },
    lodging: {
      averageCost: '$120-250/night',
      recommendedAreas: ['Downtown Atlanta', 'Midtown', 'Buckhead', 'Near Mercedes-Benz Stadium']
    }
  },
  {
    slug: 'boston',
    name: 'Boston',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Gillette Stadium',
    capacity: 65878,
    coordinates: { lat: 42.0909, lng: -71.2643 },
    description: 'Gillette Stadium in Foxborough offers a quintessential New England football experience. Home to the Patriots, the stadium is surrounded by Patriot Place, a premier shopping and entertainment destination.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Patriot Place shopping complex',
      'Historic New England charm',
      'Multiple airport options',
      'Summer weather ideal',
      'Rich American history'
    ],
    transportation: {
      airport: 'Boston Logan International Airport',
      airportCode: 'BOS',
      distanceToStadium: '28 miles',
      publicTransit: 'MBTA Commuter Rail (special event service) or shuttle buses'
    },
    lodging: {
      averageCost: '$180-350/night',
      recommendedAreas: ['Downtown Boston', 'Cambridge', 'Foxborough', 'Providence RI']
    }
  },
  {
    slug: 'houston',
    name: 'Houston',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'NRG Stadium',
    capacity: 72220,
    coordinates: { lat: 29.6847, lng: -95.4107 },
    description: 'NRG Stadium is a world-class facility with a retractable roof, located in Houston\'s bustling sports and entertainment district. The venue is known for its excellent sightlines and modern amenities.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Retractable roof',
      'Part of NRG Park complex',
      'Space City culture',
      'Tex-Mex cuisine',
      'Major medical center nearby'
    ],
    transportation: {
      airport: 'George Bush Intercontinental Airport',
      airportCode: 'IAH',
      distanceToStadium: '26 miles',
      publicTransit: 'METRORail Red Line + bus connections'
    },
    lodging: {
      averageCost: '$130-280/night',
      recommendedAreas: ['Downtown Houston', 'Medical Center', 'Galleria', 'Near NRG Park']
    }
  },
  {
    slug: 'kansas-city',
    name: 'Kansas City',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Arrowhead Stadium',
    capacity: 76416,
    coordinates: { lat: 39.0489, lng: -94.4839 },
    description: 'Arrowhead Stadium is famous for its passionate fans and record-breaking noise levels. Located in the Truman Sports Complex, it offers authentic Midwest hospitality and world-famous BBQ.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Loudest stadium record',
      'World-famous BBQ',
      'Affordable city',
      'Easy parking',
      'Tailgating culture'
    ],
    transportation: {
      airport: 'Kansas City International Airport',
      airportCode: 'MCI',
      distanceToStadium: '25 miles',
      publicTransit: 'Limited - rental car or rideshare recommended'
    },
    lodging: {
      averageCost: '$100-220/night',
      recommendedAreas: ['Downtown Kansas City', 'Plaza District', 'Near Arrowhead', 'Lee\'s Summit']
    }
  },
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'SoFi Stadium',
    capacity: 70240,
    coordinates: { lat: 33.9535, lng: -118.3392 },
    description: 'SoFi Stadium is the most expensive stadium ever built, featuring cutting-edge technology and a dramatic canopy design. Located in Inglewood, it\'s at the center of LA\'s entertainment universe.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'State-of-the-art technology',
      'Oculus video board',
      'Hollywood proximity',
      'Perfect weather',
      'Multiple airports'
    ],
    transportation: {
      airport: 'Los Angeles International Airport',
      airportCode: 'LAX',
      distanceToStadium: '3 miles',
      publicTransit: 'LA Metro K Line (Crenshaw) to Stadium/Forum station'
    },
    lodging: {
      averageCost: '$180-400/night',
      recommendedAreas: ['Inglewood', 'Santa Monica', 'Manhattan Beach', 'Downtown LA']
    }
  },
  {
    slug: 'miami',
    name: 'Miami',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Hard Rock Stadium',
    capacity: 64767,
    coordinates: { lat: 25.958, lng: -80.2389 },
    description: 'Hard Rock Stadium in Miami Gardens offers a tropical World Cup experience with open-air seating and a unique canopy design. Perfect for enjoying soccer in Florida sunshine.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Tropical climate',
      'Beach proximity',
      'Latin American culture',
      'Art Deco architecture',
      'Vibrant nightlife'
    ],
    transportation: {
      airport: 'Miami International Airport',
      airportCode: 'MIA',
      distanceToStadium: '16 miles',
      publicTransit: 'Limited - rental car, rideshare, or shuttle recommended'
    },
    lodging: {
      averageCost: '$200-450/night',
      recommendedAreas: ['Miami Beach', 'Downtown Miami', 'Brickell', 'Fort Lauderdale']
    }
  },
  {
    slug: 'new-york',
    name: 'New York / New Jersey',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'MetLife Stadium',
    capacity: 82500,
    coordinates: { lat: 40.8128, lng: -74.0742 },
    description: 'MetLife Stadium in East Rutherford, NJ offers the largest capacity of all 2026 World Cup venues. With easy access from Manhattan, it puts you at the center of the world\'s greatest city.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Largest venue capacity',
      'NYC proximity',
      'World-class entertainment',
      'Three major airports',
      'NJ Transit access'
    ],
    transportation: {
      airport: 'Newark Liberty International Airport',
      airportCode: 'EWR',
      distanceToStadium: '8 miles',
      publicTransit: 'NJ Transit trains + shuttle buses on match days'
    },
    lodging: {
      averageCost: '$250-600/night',
      recommendedAreas: ['Manhattan', 'Jersey City', 'Hoboken', 'Secaucus']
    }
  },
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Lincoln Financial Field',
    capacity: 69796,
    coordinates: { lat: 39.9008, lng: -75.1675 },
    description: 'Lincoln Financial Field sits in Philadelphia\'s Sports Complex, offering easy access to the city\'s rich history and passionate sports culture. Experience the birthplace of American independence.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Historic city',
      'Sports Complex location',
      'Passionate fans',
      'Independence Hall nearby',
      'Great food scene'
    ],
    transportation: {
      airport: 'Philadelphia International Airport',
      airportCode: 'PHL',
      distanceToStadium: '7 miles',
      publicTransit: 'SEPTA Broad Street Line to NRG Station'
    },
    lodging: {
      averageCost: '$150-320/night',
      recommendedAreas: ['Center City', 'South Philadelphia', 'University City', 'Old City']
    }
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco Bay Area',
    country: 'United States',
    countryCode: 'USA',
    stadium: "Levi's Stadium",
    capacity: 68500,
    coordinates: { lat: 37.403, lng: -121.9698 },
    description: 'Levi\'s Stadium in Santa Clara combines Silicon Valley innovation with Bay Area culture. This tech-forward venue offers a unique blend of Northern California charm and modern amenities.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Tech-forward venue',
      'Silicon Valley location',
      'Perfect weather',
      'Wine country nearby',
      'Diverse cuisine'
    ],
    transportation: {
      airport: 'San Francisco International Airport',
      airportCode: 'SFO',
      distanceToStadium: '25 miles',
      publicTransit: 'Caltrain + VTA Light Rail, special event shuttles'
    },
    lodging: {
      averageCost: '$220-500/night',
      recommendedAreas: ['San Francisco', 'San Jose', 'Santa Clara', 'Mountain View']
    }
  },
  {
    slug: 'seattle',
    name: 'Seattle',
    country: 'United States',
    countryCode: 'USA',
    stadium: 'Lumen Field',
    capacity: 68740,
    coordinates: { lat: 47.5952, lng: -122.3316 },
    description: 'Lumen Field is known for its incredible atmosphere and the "12th Man" tradition. Located in downtown Seattle, it offers stunning views of the Puget Sound and easy access to the city\'s attractions.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Downtown location',
      'Passionate soccer culture',
      'Puget Sound views',
      'Pike Place Market',
      'Coffee capital'
    ],
    transportation: {
      airport: 'Seattle-Tacoma International Airport',
      airportCode: 'SEA',
      distanceToStadium: '14 miles',
      publicTransit: 'Link Light Rail to Stadium station'
    },
    lodging: {
      averageCost: '$180-380/night',
      recommendedAreas: ['Downtown Seattle', 'Capitol Hill', 'Belltown', 'South Lake Union']
    }
  },
  {
    slug: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    countryCode: 'CAN',
    stadium: 'BMO Field',
    capacity: 45500,
    coordinates: { lat: 43.6333, lng: -79.4186 },
    description: 'BMO Field offers an intimate soccer experience in Canada\'s largest city. Located at Exhibition Place, it provides easy access to Toronto\'s vibrant waterfront and multicultural neighborhoods.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'True soccer venue',
      'Waterfront location',
      'Multicultural city',
      'Safe and clean',
      'CN Tower views'
    ],
    transportation: {
      airport: 'Toronto Pearson International Airport',
      airportCode: 'YYZ',
      distanceToStadium: '19 miles',
      publicTransit: 'TTC Streetcar (509/511) or UP Express + TTC'
    },
    lodging: {
      averageCost: 'CAD $200-400/night',
      recommendedAreas: ['Downtown Toronto', 'Liberty Village', 'King West', 'Harbourfront']
    }
  },
  {
    slug: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    countryCode: 'CAN',
    stadium: 'BC Place',
    capacity: 54500,
    coordinates: { lat: 49.2768, lng: -123.1119 },
    description: 'BC Place in downtown Vancouver features a retractable roof and stunning mountain backdrop. Experience world-class soccer in one of the world\'s most beautiful cities.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Retractable roof',
      'Mountain backdrop',
      'Spectacular city',
      'Outdoor culture',
      'Asian cuisine'
    ],
    transportation: {
      airport: 'Vancouver International Airport',
      airportCode: 'YVR',
      distanceToStadium: '8 miles',
      publicTransit: 'Canada Line SkyTrain to Stadium-Chinatown station'
    },
    lodging: {
      averageCost: 'CAD $180-380/night',
      recommendedAreas: ['Downtown Vancouver', 'Yaletown', 'Gastown', 'False Creek']
    }
  },
  {
    slug: 'guadalajara',
    name: 'Guadalajara',
    country: 'Mexico',
    countryCode: 'MEX',
    stadium: 'Estadio Akron',
    capacity: 46232,
    coordinates: { lat: 20.6906, lng: -103.4619 },
    description: 'Estadio Akron is home to Club Deportivo Guadalajara (Chivas) and represents authentic Mexican soccer passion. Experience mariachi, tequila, and incredible fan atmosphere.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Chivas home stadium',
      'Tequila region',
      'Mariachi music',
      'Colonial architecture',
      'Authentic Mexican culture'
    ],
    transportation: {
      airport: 'Guadalajara International Airport',
      airportCode: 'GDL',
      distanceToStadium: '12 miles',
      publicTransit: 'Mi Macro Periférico bus system or taxi/rideshare'
    },
    lodging: {
      averageCost: '$60-150/night',
      recommendedAreas: ['Zapopan', 'Centro Histórico', 'Providencia', 'Near Estadio Akron']
    }
  },
  {
    slug: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    countryCode: 'MEX',
    stadium: 'Estadio Azteca',
    capacity: 87523,
    coordinates: { lat: 19.3029, lng: -99.1506 },
    description: 'Estadio Azteca is the legendary venue of Maradona\'s "Hand of God" goal and Pele\'s World Cup final. Experience history at the only stadium to host two FIFA World Cup finals.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Legendary history',
      'Two World Cup finals',
      'Massive capacity',
      'Rich culture',
      'Amazing food scene'
    ],
    transportation: {
      airport: 'Mexico City International Airport',
      airportCode: 'MEX',
      distanceToStadium: '9 miles',
      publicTransit: 'Metro Line 2 to Taxqueña + light rail to Estadio Azteca'
    },
    lodging: {
      averageCost: '$70-180/night',
      recommendedAreas: ['Polanco', 'Roma', 'Condesa', 'Historic Center']
    }
  },
  {
    slug: 'monterrey',
    name: 'Monterrey',
    country: 'Mexico',
    countryCode: 'MEX',
    stadium: 'Estadio BBVA',
    capacity: 53500,
    coordinates: { lat: 25.7209, lng: -100.2441 },
    description: 'Estadio BBVA is one of the most modern stadiums in the Americas, home to CF Monterrey. Set against the stunning Cerro de la Silla mountain, it offers a unique Mexican World Cup experience.',
    isAvailable: false,
    releaseDate: '2025-12-05',
    highlights: [
      'Ultra-modern venue',
      'Mountain backdrop',
      'Northern Mexico culture',
      'Industrial city',
      'Carne asada tradition'
    ],
    transportation: {
      airport: 'Monterrey International Airport',
      airportCode: 'MTY',
      distanceToStadium: '16 miles',
      publicTransit: 'Metrorrey Line 2 + taxi/rideshare'
    },
    lodging: {
      averageCost: '$60-140/night',
      recommendedAreas: ['San Pedro Garza García', 'Centro', 'Monterrey Valley', 'Near stadium']
    }
  }
];

export function getCityGuideBySlug(slug: string): CityGuide | undefined {
  return cityGuides.find(city => city.slug === slug);
}

export function getCityGuidesByCountry(countryCode: 'USA' | 'CAN' | 'MEX'): CityGuide[] {
  return cityGuides.filter(city => city.countryCode === countryCode);
}

export function getAvailableCityGuides(): CityGuide[] {
  return cityGuides.filter(city => city.isAvailable);
}
