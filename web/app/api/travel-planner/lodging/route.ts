import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';

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

    // Load city-specific context for detailed lodging recommendations
    const cityContext = await loadCityContext(tripContext.citiesVisiting, 'en');
    const cityContextPrompt = formatCityContextForPrompt(cityContext);

    // Build the system prompt for lodging recommendations
    const systemPrompt = `You are a lodging specialist for World Cup 2026 travel. Your role is to provide detailed neighborhood and accommodation recommendations based on the traveler's trip overview and city-specific guides.

For each city in the itinerary, provide:
- 2-3 specific neighborhood/zone options
- Why each area makes sense for this traveler
- Estimated nightly rates (accounting for World Cup premium pricing)
- Transit access to stadium and fan festival
- Neighborhood character and safety
- Pros and cons
- Specific hotel/area recommendations

Consider:
- Budget level from trip overview
- Group composition (families need different areas than young adults)
- Transport mode preference (car vs public transit)
- Mobility considerations
- Match day logistics

Return ONLY valid JSON in this exact structure:
{
  "cities": [
    {
      "cityName": "Atlanta",
      "stayDuration": "3 nights",
      "lodgingOptions": [
        {
          "zoneName": "Midtown",
          "priority": "recommended" | "alternative" | "budget",
          "whyStayHere": "Walking distance to MARTA, direct line to stadium, safe area with restaurants",
          "estimatedRate": "$180-$250/night",
          "hotelTypes": ["3-star chain hotels", "boutique hotels"],
          "transitToStadium": "15 min via MARTA Red/Gold Line direct",
          "transitToFanFest": "10 min walk to Centennial Park",
          "neighborhoodVibe": "Urban, walkable, diverse dining",
          "accessibility": "Excellent - flat terrain, MARTA elevators",
          "pros": ["Best transit access", "Walkable to attractions", "Safe 24/7"],
          "cons": ["Higher prices", "Hotel parking expensive"],
          "specificRecommendations": ["Hotel Indigo Midtown", "Hampton Inn & Suites"]
        }
      ],
      "bookingTips": ["Book 4-6 months ahead", "Check for World Cup cancellation policies"],
      "matchDayLogistics": "Take MARTA Red/Gold Line from Midtown station directly to Mercedes-Benz Stadium station. 15 minutes, $2.50 each way."
    }
  ],
  "generalAdvice": [
    "World Cup timing means 30-50% premium on normal rates",
    "Book refundable rates if match schedule changes"
  ]
}`;

    const userPrompt = `Generate lodging recommendations based on this trip context:

**Trip Overview:**
${JSON.stringify(tripContext.overview, null, 2)}

**Cities and Stay Duration:**
${tripContext.overview.cityStays.map((stay: any) => 
  `- ${stay.city}: ${stay.nights} nights (${stay.arrivalDate} to ${stay.departureDate})`
).join('\n')}

**Group:** ${tripContext.groupSize} adults${tripContext.children > 0 ? `, ${tripContext.children} children` : ''}${tripContext.seniors > 0 ? `, ${tripContext.seniors} seniors` : ''}
**Budget Level:** ${tripContext.budgetLevel}
**Transport Mode:** ${tripContext.transportMode}
**Mobility Needs:** ${tripContext.mobilityIssues ? 'Yes - accessibility important' : 'No special needs'}

**City-Specific Guides:**
${cityContextPrompt}

**CRITICAL:** Use the city guides above as your PRIMARY source for neighborhood recommendations, transit information, and lodging zones. These contain verified local knowledge.

Generate detailed lodging recommendations for each city. Return ONLY the JSON structure specified.`;

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

    const lodgingData = JSON.parse(jsonText);

    // Update trip session with lodging data
    const { error: updateError } = await supabase
      .from('trip_sessions')
      .update({ 
        lodging_data: {
          ...lodgingData,
          generatedAt: new Date().toISOString()
        }
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Failed to update lodging data:', updateError);
      return NextResponse.json({ error: 'Failed to save lodging recommendations' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      sessionId: session.id,
      lodging: lodgingData,
      message: 'Lodging recommendations generated successfully.'
    });

  } catch (error) {
    console.error('Lodging generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lodging recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
