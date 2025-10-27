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
const CONTEXT_ROOT = path.join(process.cwd(), 'ai_travel_planner', 'context');

const normalizeForMatch = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getLanguageDir = (language: 'en' | 'fr' | 'es') => path.join(CONTEXT_ROOT, language);

export type LodgingMarkdownDoc = {
  fileName: string;
  content: string;
};

export async function loadCityContext(
  cityNames: string[],
  language: 'en' | 'fr' | 'es' = 'en'
): Promise<Record<string, string>> {
  const contextPath = getLanguageDir(language);
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
 * Loads all lodging-specific markdown docs for a given city.
 * Filenames follow the convention "<city> Lodging ... .md".
 */
export function loadCityLodgingMarkdown(
  cityName: string,
  language: 'en' | 'fr' | 'es' = 'en'
): LodgingMarkdownDoc[] {
  const dir = getLanguageDir(language);
  if (!fs.existsSync(dir)) {
    console.warn(`Lodging context directory missing: ${dir}`);
    return [];
  }

  const normalizedCity = normalizeForMatch(cityName);
  if (!normalizedCity) {
    return [];
  }

  const docs: LodgingMarkdownDoc[] = [];
  const entries = fs.readdirSync(dir);
  for (const fileName of entries) {
    const lower = fileName.toLowerCase();
    if (!lower.endsWith('.md') || !lower.includes('lodging')) continue;

    const normalizedFile = normalizeForMatch(fileName);
    if (!normalizedFile.startsWith(normalizedCity)) continue;

    const filePath = path.join(dir, fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      docs.push({ fileName, content });
    } catch (err) {
      console.error(`Failed to read lodging file ${filePath}`, err);
    }
  }

  if (docs.length === 0) {
    console.warn(`No lodging markdown docs found for ${cityName}`);
  }

  return docs;
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
