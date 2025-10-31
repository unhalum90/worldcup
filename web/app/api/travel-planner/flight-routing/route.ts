import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

interface FlightRoutingRequest {
  originCity: string;
  originAirport?: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  cities: Array<{ name: string; airport_code: string; country: string }>;
  cityOrder: string[];
  transportMode: 'public' | 'car' | 'mixed';
  startDate: string;
  endDate: string;
  groupSize: number;
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

async function generateFlightPlan(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  prompt: string,
  attempt = 0,
) {
  const attemptPrompt =
    attempt === 0
      ? prompt
      : `${prompt}

IMPORTANT: Respond with valid minified JSON only. Do not include markdown fences, commentary, or trailing commas.`;

  const result = await model.generateContent(attemptPrompt);
  const text = result.response.text();
  const cleaned = cleanupJsonResponse(text);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    if (attempt >= 2) {
      throw error;
    }
    console.warn('Flight routing JSON parse failed, retrying...', {
      attempt: attempt + 1,
      reason: error instanceof Error ? error.message : String(error),
      response: cleaned.slice(0, 200),
    });
    return generateFlightPlan(model, prompt, attempt + 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: FlightRoutingRequest = await request.json();
    
    const locale = data.locale || 'en';
    const isSpanish = locale === 'es';
    
    const languageInstruction = isSpanish 
      ? '\n**IMPORTANTE: Responde en español. Mantén los nombres de aeropuertos y aerolíneas en su forma original.**\n'
      : '';

    // Focused prompt for just flight routing
    const prompt = `You are a World Cup 2026 flight routing specialist.${languageInstruction}

Generate realistic flight routing for this trip:
- Origin: ${data.originCity}${data.originAirport ? ` (${data.originAirport.code})` : ''}
- Cities in order: ${data.cityOrder.join(' → ')}
- Transport Mode: ${data.transportMode}
- Dates: ${data.startDate} to ${data.endDate}
- Group Size: ${data.groupSize}

Airports:
${data.cities.map(c => `- ${c.name}: ${c.airport_code}`).join('\n')}

RULES:
1. Cover ALL segments: Origin → First City, each inter-city move, Last City → Origin
2. Use realistic airlines that actually serve these routes
3. Provide duration in format "Xh Ym" (direct or with layover)
4. Include example departure/arrival times
5. Note frequency (daily, 3x weekly, etc.)
6. For layovers, specify hub city and duration
7. Do NOT include flight costs - just note to use Flight Planner for pricing

Return ONLY valid JSON following this schema:

{
  "legs": [
    {
      "from": "Origin City (CODE)",
      "to": "Destination City (CODE)",
      "airlines": ["Airline 1", "Airline 2"],
      "duration": "Xh Ym direct",
      "exampleDeparture": "HH:MM",
      "exampleArrival": "HH:MM",
      "frequency": "daily",
      "notes": "Brief comfort or routing tip",
      "layoverBefore": "Hub City (HUB)" (if applicable),
      "layoverNotes": "Duration and tips" (if applicable)
    }
  ],
  "costNote": "Use the Flight Planner to view live pricing for these routes — estimated ranges are intentionally omitted here."
}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
    
    const flightPlan = await generateFlightPlan(model, prompt);

    return NextResponse.json(flightPlan);

  } catch (error) {
    console.error('Flight routing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flight routing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
