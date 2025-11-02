export interface Venue {
  city: string;
  stadium: string;
  lat: number;
  lng: number;
}

export const venues: Venue[] = [
  { city: "Mexico City", stadium: "Estadio Azteca", lat: 19.3029, lng: -99.1505 },
  { city: "Guadalajara", stadium: "Estadio Akron", lat: 20.5993, lng: -103.4457 },
  { city: "Monterrey", stadium: "Estadio BBVA", lat: 25.6487, lng: -100.2865 },
  { city: "Atlanta", stadium: "Mercedes-Benz Stadium", lat: 33.7554, lng: -84.4008 },
  { city: "Toronto", stadium: "BMO Field", lat: 43.6336, lng: -79.4181 },
  { city: "San Francisco", stadium: "Levi's Stadium", lat: 37.4030, lng: -121.9692 },
  { city: "Los Angeles", stadium: "SoFi Stadium", lat: 33.9535, lng: -118.3386 },
  { city: "Vancouver", stadium: "BC Place", lat: 49.2768, lng: -123.1120 },
  { city: "Seattle", stadium: "Lumen Field", lat: 47.5952, lng: -122.3316 },
  { city: "Boston", stadium: "Gillette Stadium", lat: 42.0909, lng: -71.2643 },
  { city: "New York", stadium: "MetLife Stadium", lat: 40.8135, lng: -74.0745 },
  { city: "Miami", stadium: "Hard Rock Stadium", lat: 25.9578, lng: -80.2389 },
  { city: "Philadelphia", stadium: "Lincoln Financial Field", lat: 39.9008, lng: -75.1675 },
  { city: "Houston", stadium: "NRG Stadium", lat: 29.6847, lng: -95.4107 },
  { city: "Kansas City", stadium: "Arrowhead Stadium", lat: 39.0489, lng: -94.4839 },
  { city: "Dallas", stadium: "AT&T Stadium", lat: 32.7473, lng: -97.0945 },
];
