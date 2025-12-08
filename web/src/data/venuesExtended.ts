export interface VenueExtended {
  city: string;
  stadium: string;
  lat: number;
  lng: number;
  transit: 'EXCELLENT' | 'GOOD' | 'LIMITED' | 'NONE';
  transitNote: string;
  capacity: number;
  country: 'USA' | 'Mexico' | 'Canada';
}

export const venuesExtended: VenueExtended[] = [
  { 
    city: "Mexico City", 
    stadium: "Estadio Azteca", 
    lat: 19.3029, 
    lng: -99.1505,
    transit: 'GOOD',
    transitNote: 'Metro Line 2 to Tasqueña, then light rail to Estadio Azteca station. 45 min from Centro.',
    capacity: 87523,
    country: 'Mexico'
  },
  { 
    city: "Guadalajara", 
    stadium: "Estadio Akron", 
    lat: 20.5993, 
    lng: -103.4457,
    transit: 'LIMITED',
    transitNote: 'No direct rail. Rideshare or event shuttles from downtown. 30-40 min drive.',
    capacity: 49850,
    country: 'Mexico'
  },
  { 
    city: "Monterrey", 
    stadium: "Estadio BBVA", 
    lat: 25.6487, 
    lng: -100.2865,
    transit: 'GOOD',
    transitNote: 'Metro Line 1 to Talleres, then shuttle or walk 20 min. Event-day shuttles expected.',
    capacity: 53500,
    country: 'Mexico'
  },
  { 
    city: "Atlanta", 
    stadium: "Mercedes-Benz Stadium", 
    lat: 33.7554, 
    lng: -84.4008,
    transit: 'EXCELLENT',
    transitNote: 'MARTA rail to Dome/GWCC/Philips Arena station, 5 min walk to stadium.',
    capacity: 71000,
    country: 'USA'
  },
  { 
    city: "Toronto", 
    stadium: "BMO Field", 
    lat: 43.6336, 
    lng: -79.4181,
    transit: 'EXCELLENT',
    transitNote: 'Streetcar 509 or 511 from Union Station. 15 min to Exhibition Place.',
    capacity: 45500,
    country: 'Canada'
  },
  { 
    city: "San Francisco", 
    stadium: "Levi's Stadium", 
    lat: 37.4030, 
    lng: -121.9692,
    transit: 'LIMITED',
    transitNote: 'VTA Light Rail to Great America station, 10 min walk. 45 min from SF on Caltrain + VTA.',
    capacity: 71000,
    country: 'USA'
  },
  { 
    city: "Los Angeles", 
    stadium: "SoFi Stadium", 
    lat: 33.9535, 
    lng: -118.3386,
    transit: 'NONE',
    transitNote: 'No rail to Inglewood; shuttles or rideshare required from downtown LA.',
    capacity: 70240,
    country: 'USA'
  },
  { 
    city: "Vancouver", 
    stadium: "BC Place", 
    lat: 49.2768, 
    lng: -123.1120,
    transit: 'EXCELLENT',
    transitNote: 'SkyTrain to Stadium-Chinatown station, steps from the venue.',
    capacity: 54500,
    country: 'Canada'
  },
  { 
    city: "Seattle", 
    stadium: "Lumen Field", 
    lat: 47.5952, 
    lng: -122.3316,
    transit: 'EXCELLENT',
    transitNote: 'Link Light Rail to Stadium station, 2 min walk.',
    capacity: 69000,
    country: 'USA'
  },
  { 
    city: "Boston", 
    stadium: "Gillette Stadium", 
    lat: 42.0909, 
    lng: -71.2643,
    transit: 'LIMITED',
    transitNote: 'Commuter Rail from South Station + event shuttle. 60-75 min from Boston.',
    capacity: 65878,
    country: 'USA'
  },
  { 
    city: "New York", 
    stadium: "MetLife Stadium", 
    lat: 40.8135, 
    lng: -74.0745,
    transit: 'GOOD',
    transitNote: 'NJ Transit from Penn Station to Secaucus, then event shuttle to Meadowlands.',
    capacity: 82500,
    country: 'USA'
  },
  { 
    city: "Miami", 
    stadium: "Hard Rock Stadium", 
    lat: 25.9578, 
    lng: -80.2389,
    transit: 'LIMITED',
    transitNote: '20 mile drive from downtown with no fixed-route transit. Rideshare or event shuttles.',
    capacity: 65326,
    country: 'USA'
  },
  { 
    city: "Philadelphia", 
    stadium: "Lincoln Financial Field", 
    lat: 39.9008, 
    lng: -75.1675,
    transit: 'EXCELLENT',
    transitNote: 'SEPTA Broad Street Line to AT&T station, 5 min walk to stadium.',
    capacity: 69796,
    country: 'USA'
  },
  { 
    city: "Houston", 
    stadium: "NRG Stadium", 
    lat: 29.6847, 
    lng: -95.4107,
    transit: 'GOOD',
    transitNote: 'METRORail Red Line to NRG Park station. 25 min from downtown.',
    capacity: 72220,
    country: 'USA'
  },
  { 
    city: "Kansas City", 
    stadium: "Arrowhead Stadium", 
    lat: 39.0489, 
    lng: -94.4839,
    transit: 'NONE',
    transitNote: 'No rail service. 10 miles east of downtown; rideshare or drive with parking.',
    capacity: 76416,
    country: 'USA'
  },
  { 
    city: "Dallas", 
    stadium: "AT&T Stadium", 
    lat: 32.7473, 
    lng: -97.0945,
    transit: 'NONE',
    transitNote: 'No direct rail to Arlington. TRE to CentrePort then shuttle, or rideshare 30-40 min.',
    capacity: 80000,
    country: 'USA'
  },
];

export function getVenueByCity(city: string): VenueExtended | undefined {
  return venuesExtended.find(v => v.city.toLowerCase() === city.toLowerCase());
}

export function getVenueByStadium(stadium: string): VenueExtended | undefined {
  return venuesExtended.find(v => v.stadium.toLowerCase() === stadium.toLowerCase());
}
