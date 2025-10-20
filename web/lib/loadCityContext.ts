import fs from 'fs';
import path from 'path';

/**
 * Maps database city names to context file names
 * Database uses full names, files use lowercase-hyphenated format
 * Includes variations to handle different naming conventions
 */
export const CITY_NAME_MAP: Record<string, string> = {
  'Dallas': 'dallas',
  'Atlanta': 'atlanta',
  'Houston': 'houston',
  'Kansas City': 'kansas-city',
  'Miami': 'miami',
  'Los Angeles': 'los-angeles',
  'San Francisco Bay Area': 'san-francisco',
  'San Francisco': 'san-francisco', // Handle short form
  'Seattle': 'seattle',
  'Boston': 'boston',
  'New York': 'new-york', // Handle both "New York" and "New York/New Jersey"
  'New York/New Jersey': 'new-york',
  'New York / New Jersey': 'new-york', // Handle spacing variation
  'Philadelphia': 'philadelphia',
  'Toronto': 'toronto',
  'Vancouver': 'vancouver',
  'Guadalajara': 'guadalajara',
  'Mexico City': 'mexico-city',
  'Monterrey': 'monterrey',
};

/**
 * Loads city context markdown files for the AI travel planner
 * @param cityNames - Array of city names from the database
 * @param language - Language code (en, fr, es). Defaults to 'en'
 * @returns Object with city names as keys and their markdown content as values
 */
export async function loadCityContext(
  cityNames: string[],
  language: 'en' | 'fr' | 'es' = 'en'
): Promise<Record<string, string>> {
  const contextPath = path.join(process.cwd(), 'ai_travel_planner', 'context', language);
  const cityContext: Record<string, string> = {};

  console.log('Loading city context for:', cityNames);

  for (const cityName of cityNames) {
    try {
      // Convert database city name to file name
      const fileName = CITY_NAME_MAP[cityName];
      
      if (!fileName) {
        console.warn(`❌ No context file mapping found for city: "${cityName}"`);
        console.warn(`   Available mappings:`, Object.keys(CITY_NAME_MAP));
        continue;
      }

      const filePath = path.join(contextPath, `${fileName}.md`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`❌ Context file not found: ${filePath}`);
        continue;
      }

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Skip placeholder files (check if it contains "PASTE YOUR" text)
      if (content.includes('PASTE YOUR') || content.includes('Replace this placeholder')) {
        console.warn(`Context file for ${cityName} is still a placeholder`);
        continue;
      }

      cityContext[cityName] = content;
      console.log(`✅ Loaded context for ${cityName} (${fileName}.md)`);
    } catch (error) {
      console.error(`Error loading context for ${cityName}:`, error);
    }
  }

  return cityContext;
}

/**
 * Formats city context into a structured prompt section for Gemini
 * @param cityContext - Object with city names and their context
 * @returns Formatted string ready to inject into the AI prompt
 */
export function formatCityContextForPrompt(cityContext: Record<string, string>): string {
  if (Object.keys(cityContext).length === 0) {
    return '';
  }

  let formatted = '\n\n**AUTHORITATIVE CITY GUIDES** (Use this information as the primary source for recommendations):\n\n';

  for (const [cityName, content] of Object.entries(cityContext)) {
    formatted += `--- ${cityName.toUpperCase()} ---\n`;
    formatted += content;
    formatted += '\n\n';
  }

  return formatted;
}
