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
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const flightPlan = JSON.parse(jsonText);

    return NextResponse.json(flightPlan);

  } catch (error) {
    console.error('Flight routing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flight routing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
