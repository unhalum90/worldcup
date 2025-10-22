import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to use the travel planner.' },
        { status: 401 }
      );
    }

    // Get the latest trip session for this user
    const { data: session, error: sessionError } = await supabase
      .from('trip_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No trip overview found. Please start by creating a trip overview first.' },
        { status: 404 }
      );
    }

    const tripContext = session.trip_context;

    // Build the system prompt for flight recommendations
    const systemPrompt = `You are a flight routing specialist for World Cup 2026 travel. Your role is to provide detailed, realistic flight recommendations based on the traveler's trip overview.

Generate 2-3 flight options (e.g., "Most Affordable", "Best Convenience", "Premium Comfort") with specific details including:
- Exact routing with all flight legs
- Realistic airlines that operate these routes
- Estimated durations and layover times
- Example departure/arrival times based on typical schedules
- Cost estimates per person
- Booking tips and timing recommendations

Consider:
- International vs domestic flight pricing
- Connection cities and layover efficiency
- Seasonal demand (World Cup = peak summer prices)
- Group size affecting availability and pricing
- Budget level from trip overview

Return ONLY valid JSON in this exact structure:
{
  "options": [
    {
      "title": "Most Affordable Route",
      "summary": "Brief description of this option's strategy",
      "totalCostPerPerson": "$2,500 - $3,200",
      "bookingTips": ["Book 3-4 months in advance", "Consider budget airlines for domestic legs"],
      "legs": [
        {
          "from": "Istanbul (IST)",
          "to": "New York (JFK)",
          "airlines": ["Turkish Airlines", "Lufthansa"],
          "duration": "11h 30m direct",
          "exampleDeparture": "23:45",
          "exampleArrival": "04:15 (+1 day)",
          "frequency": "Daily",
          "estimatedCost": "$800 - $1,200",
          "notes": "Turkish Airlines offers competitive direct flights"
        }
      ],
      "pros": ["Lower overall cost", "Good connection times"],
      "cons": ["Longer travel time", "More connections"]
    }
  ],
  "generalAdvice": [
    "World Cup timing means premium pricing - book as early as possible",
    "Consider flying into one city and out of another to save backtracking"
  ]
}`;

    const userPrompt = `Generate flight recommendations based on this trip context:

**Trip Overview:**
${JSON.stringify(tripContext.overview, null, 2)}

**Origin:** ${tripContext.originCity}${tripContext.originAirport ? ` (${tripContext.originAirport.code})` : ''}
**Destination Cities:** ${tripContext.citiesVisiting.join(', ')}
**Travel Dates:** ${tripContext.startDate} to ${tripContext.endDate}
**Group:** ${tripContext.groupSize} adults${tripContext.children > 0 ? `, ${tripContext.children} children` : ''}${tripContext.seniors > 0 ? `, ${tripContext.seniors} seniors` : ''}
**Budget Level:** ${tripContext.budgetLevel}

Generate 2-3 realistic flight routing options. Return ONLY the JSON structure specified.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });
    
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const flightsData = JSON.parse(jsonText);

    // Update trip session with flights data
    const { error: updateError } = await supabase
      .from('trip_sessions')
      .update({ 
        flights_data: {
          ...flightsData,
          generatedAt: new Date().toISOString()
        }
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Failed to update flights data:', updateError);
      return NextResponse.json({ error: 'Failed to save flight recommendations' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      sessionId: session.id,
      flights: flightsData,
      message: 'Flight recommendations generated successfully.'
    });

  } catch (error) {
    console.error('Flights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flight recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
