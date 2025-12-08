import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { team1, team2, city, stadium } = await request.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: 'team1 and team2 are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate factual World Cup 2026 match information for ${team1} vs ${team2} at ${stadium} in ${city}.

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
  "team1_fan_culture": "<2-3 words describing ${team1} fan culture, e.g. 'Loud, Festive, Non-stop Chanting'>",
  "team2_fan_culture": "<2-3 words describing ${team2} fan culture, e.g. 'Vuvuzela & Makaraba'>",
  "team1_staple_food": "<iconic food from ${team1}'s country, e.g. 'Tacos, Mole, Tortas'>",
  "team2_staple_food": "<iconic food from ${team2}'s country, e.g. 'Braai (BBQ), Biltong'>",
  "team1_avg_flight_budget": "<estimated flight budget range for ${team1} fans to reach ${city}, e.g. 'N/A (Host)' or '$1,400 - $2,500'>",
  "team2_avg_flight_budget": "<estimated flight budget range for ${team2} fans to reach ${city}, e.g. '$1,400 - $2,500'>",
  "team1_visa_info": "<visa requirements for ${team1} citizens to visit ${city.includes('Mexico') ? 'Mexico' : city.includes('Canada') || city.includes('Toronto') || city.includes('Vancouver') ? 'Canada' : 'USA'}, e.g. 'N/A (Host)' or 'B-2 (US) / TRV (CA)'>",
  "team2_visa_info": "<visa requirements for ${team2} citizens>",
  "venue_history": "<1-2 sentences about the stadium's World Cup history or significance>"
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
  } catch (error: any) {
    console.error('Error generating match facts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
