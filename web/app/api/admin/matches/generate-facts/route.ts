import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Determine host country based on city
function getHostCountry(city: string): string {
  const mexicoCities = ['Mexico City', 'Guadalajara', 'Monterrey'];
  const canadaCities = ['Toronto', 'Vancouver'];
  
  if (!city) return 'USA';
  if (mexicoCities.some(c => city.toLowerCase().includes(c.toLowerCase()))) return 'Mexico';
  if (canadaCities.some(c => city.toLowerCase().includes(c.toLowerCase()))) return 'Canada';
  return 'USA';
}

export async function POST(request: NextRequest) {
  try {
    const { team1, team2, city, stadium } = await request.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: 'team1 and team2 are required' }, { status: 400 });
    }

    const hostCountry = getHostCountry(city || '');
    const cityName = city || 'the host city';
    const stadiumName = stadium || 'the stadium';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate factual World Cup 2026 match information for ${team1} vs ${team2} at ${stadiumName} in ${cityName}.

Return a JSON object with these exact fields (use real historical data where available, estimate where needed):

{
  "head_to_head": {
    "team1_wins": <number of times ${team1} has beaten ${team2} historically>,
    "team2_wins": <number of times ${team2} has beaten ${team1} historically>,
    "draws": <number of draws>,
    "last_meeting": "<description of last competitive match, e.g. 'World Cup 2010 Group Stage: 1-1 draw'>"
  },
  "team1_wc_appearances": <number of World Cup tournaments ${team1} has qualified for including 2026>,
  "team2_wc_appearances": <number of World Cup tournaments ${team2} has qualified for including 2026>,
  "team1_fan_culture": "<2-3 sentences describing ${team1} fan culture and traditions>",
  "team2_fan_culture": "<2-3 sentences describing ${team2} fan culture and traditions>",
  "team1_staple_food": "<iconic food from ${team1}'s country, e.g. 'Tacos, Mole, Tortas'>",
  "team2_staple_food": "<iconic food from ${team2}'s country, e.g. 'Braai (BBQ), Biltong'>",
  "team1_avg_flight_budget": "<estimated flight budget range for ${team1} fans to reach ${cityName}, e.g. 'N/A (Host)' or '$1,400 - $2,500'>",
  "team2_avg_flight_budget": "<estimated flight budget range for ${team2} fans to reach ${cityName}, e.g. '$1,400 - $2,500'>",
  "team1_visa_info": "<visa requirements for ${team1} citizens to visit ${hostCountry}, e.g. 'N/A (Host)' or 'B-2 (US) / TRV (CA)'>",
  "team2_visa_info": "<visa requirements for ${team2} citizens to visit ${hostCountry}>",
  "venue_history": "<1-2 sentences about ${stadiumName}'s history or significance>"
}

Important: 
- Use accurate historical head-to-head data if you know it
- For host nations (USA, Canada, Mexico), use "N/A (Host)" for flight budget and visa
- Be concise but informative
- Return ONLY the JSON object, no markdown formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let facts;
    try {
      // Remove any markdown code blocks if present
      const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      facts = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }

    return NextResponse.json(facts);
  } catch (error: unknown) {
    console.error('Error generating match facts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
