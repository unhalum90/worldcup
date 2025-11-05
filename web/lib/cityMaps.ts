/**
 * Maps city names to their World Cup map image files
 * Files are located in /world_cup_maps/ directory
 */
export const CITY_MAP_FILES: Record<string, string> = {
  'Dallas': '/world_cup_maps/dallas_world_cup_map.png',
  'Atlanta': '/world_cup_maps/Atlanta_world_cup_map.jpg',
  'Houston': '/world_cup_maps/Houston_world_cup_map.jpg',
  'Kansas City': '/world_cup_maps/Kansas_City_World_Cup_map.jpg',
  'Miami': '/world_cup_maps/Miami_World _Cup_map.jpg',
  'Los Angeles': '/world_cup_maps/Los_Angeles_World_Cup.jpg',
  'San Francisco Bay Area': '/world_cup_maps/San_Fran_world_cup_map.jpg',
  'Seattle': '/world_cup_maps/Seattle_World_cup_map.jpg',
  'Boston': '/world_cup_maps/Boston_World_cup_Map.jpg',
  'New York/New Jersey': '/world_cup_maps/NY _World_cup_map.jpg',
  // Alias used by cityGuidesData
  'New York / New Jersey': '/world_cup_maps/NY _World_cup_map.jpg',
  'Philadelphia': '/world_cup_maps/Philly_world_cup_map.jpg',
  'Toronto': '/world_cup_maps/Toronto_World_Cup_Map.jpg',
  'Vancouver': '/world_cup_maps/Vancouver_world_cup map.jpg',
  'Guadalajara': '/world_cup_maps/Guadalajara_World_Cup_Map.jpg',
  'Mexico City': '/world_cup_maps/Mexico_City_world_cup_map.jpg',
  'Monterrey': '/world_cup_maps/Monterrey_World_cup_map.jpg',
};

/**
 * Get the map image path for a city
 * @param cityName - Name of the city
 * @returns Image path or null if not found
 */
export function getCityMapPath(cityName: string): string | null {
  if (CITY_MAP_FILES[cityName]) return CITY_MAP_FILES[cityName];
  // Lightweight normalization: collapse spaces around slashes, trim, and try case-insensitive match
  const normalized = cityName.replace(/\s*\/\s*/g, '/').trim().toLowerCase();
  for (const key of Object.keys(CITY_MAP_FILES)) {
    const keyNorm = key.replace(/\s*\/\s*/g, '/').trim().toLowerCase();
    if (keyNorm === normalized) return CITY_MAP_FILES[key];
  }
  return null;
}
