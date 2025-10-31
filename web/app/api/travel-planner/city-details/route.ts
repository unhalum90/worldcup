import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

interface CityDetailsRequest {
  cityName: string;
  cityData: {
    name: string;
    stadium_name: string;
    fan_fest_location: string;
    airport_code: string;
    country: string;
  };
  budgetLevel: 'budget' | 'moderate' | 'premium';
  groupSize: number;
  children: number;
  seniors: number;
  mobilityIssues: boolean;
  nightsInCity: number;
  hasMatchTicket: boolean;
  matchDate?: string;
  tripFocus?: string[];
  locale?: string;
}

function cleanupJsonResponse(raw: string) {
  let jsonText = raw.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
  }
  jsonText = jsonText.trim();
  const curlyStart = jsonText.indexOf('{');
  const curlyEnd = jsonText.lastIndexOf('}');
  if (curlyStart !== -1 && curlyEnd > curlyStart) {
    return jsonText.slice(curlyStart, curlyEnd + 1);
  }
  const squareStart = jsonText.indexOf('[');
  const squareEnd = jsonText.lastIndexOf(']');
  if (squareStart !== -1 && squareEnd > squareStart) {
    return jsonText.slice(squareStart, squareEnd + 1);
  }
  return jsonText;
}

async function generateCityDetails(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  prompt: string,
  attempt = 0,
) {
  const attemptPrompt =
    attempt === 0
      ? prompt
      : `${prompt}

IMPORTANTE: Devuelve solo JSON válido y completamente cerrado. Sin markdown ni texto adicional.`;

  const result = await model.generateContent(attemptPrompt);
  const text = result.response.text();
  const cleaned = cleanupJsonResponse(text);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    if (attempt >= 2) {
      throw error;
    }
    console.warn('City details JSON parse failed, retrying...', {
      attempt: attempt + 1,
      reason: error instanceof Error ? error.message : String(error),
      response: cleaned.slice(0, 200),
    });
    return generateCityDetails(model, prompt, attempt + 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CityDetailsRequest = await request.json();
    
    const locale = data.locale || 'en';
    const isSpanish = locale === 'es';
    
    const languageInstruction = isSpanish 
      ? '\n**IMPORTANTE: Responde en español. Mantén nombres propios en su forma original.**\n'
      : '';

    // Load city context if available
    const USE_CITY_CONTEXT = process.env.PLANNER_USE_CITY_CONTEXT === 'true';
    let cityContextPrompt = '';
    if (USE_CITY_CONTEXT) {
      const cityContext = await loadCityContext([data.cityName], locale as any);
      cityContextPrompt = formatCityContextForPrompt(cityContext);
    }

    // Focused prompt for single city details
    const prompt = `You are a World Cup 2026 city specialist for ${data.cityName}.${languageInstruction}

Generate detailed lodging zones and logistics for this city:

City: ${data.cityData.name}, ${data.cityData.country}
- Stadium: ${data.cityData.stadium_name}
- Fan Festival: ${data.cityData.fan_fest_location}
- Airport: ${data.cityData.airport_code}

Traveler Profile:
- Budget Level: ${data.budgetLevel}
- Group: ${data.groupSize} adults${data.children > 0 ? `, ${data.children} children` : ''}${data.seniors > 0 ? `, ${data.seniors} seniors` : ''}
- Mobility Considerations: ${data.mobilityIssues ? 'Yes' : 'No'}
- Nights in ${data.cityName}: ${data.nightsInCity}
${data.hasMatchTicket && data.matchDate ? `- Match Day: ${data.matchDate} (has ticket)` : ''}
${data.tripFocus && data.tripFocus.length ? `- Focus: ${data.tripFocus.join(', ')}` : ''}

REQUIREMENTS:
1. Provide 2-3 lodging zones aligned with budget and needs
2. Include transit times to stadium AND Fan Fest
3. Provide 3-4 realistic, specific insider tips
4. Add match day logistics if they have a ticket

Lodging Rates by Budget:
- budget: $120-$220/night
- moderate: $180-$320/night  
- premium: $300-$600+/night

${USE_CITY_CONTEXT ? cityContextPrompt : 'Use your knowledge of real neighborhoods, transit systems, and World Cup logistics.'}

Return ONLY valid JSON:

{
  "lodgingZones": [
    {
      "zoneName": "Neighborhood Name",
      "whyStayHere": "Brief rationale aligned with traveler profile",
      "estimatedRate": "$XXX-$XXX/night",
      "transitToStadium": "mode + time",
      "transitToFanFest": "mode + time",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"]
    }
  ],
  "matchDayLogistics": "How to reach stadium from zones, key transit routes",
  "insiderTips": [
    "Specific, actionable tip 1",
    "Specific, actionable tip 2",
    "Specific, actionable tip 3"
  ]
}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
    
    const cityDetails = await generateCityDetails(model, prompt);

    return NextResponse.json({
      cityName: data.cityName,
      ...cityDetails
    });

  } catch (error) {
    console.error('City details error:', error);
    return NextResponse.json(
      { error: 'Failed to generate city details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
