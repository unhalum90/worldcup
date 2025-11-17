import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

interface OverviewRequest {
  originCity: string;
  originAirport?: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  groupSize: number;
  children: number;
  seniors: number;
  mobilityIssues: boolean;
  citiesVisiting: string[];
  transportMode: 'public' | 'car' | 'mixed';
  budgetLevel: 'budget' | 'moderate' | 'premium';
  startDate: string;
  endDate: string;
  personalContext: string;
}

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

    const formData: OverviewRequest = await request.json();

    // Fetch city data from database
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('name, stadium_name, stadium_lat, stadium_long, fan_fest_location, fan_fest_lat, fan_fest_long, airport_code, country')
      .in('name', formData.citiesVisiting);

    if (citiesError) {
      console.error('Database error:', citiesError);
      return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
    }

    // Load city-specific context files
    console.log('Loading city context for:', formData.citiesVisiting);
    const cityContext = await loadCityContext(formData.citiesVisiting, 'en');
    const cityContextPrompt = formatCityContextForPrompt(cityContext);

    // Build the system prompt for the overview generation
    const systemPrompt = `You are a World Cup 2026 travel planning specialist. Your role is to analyze traveler preferences and create a comprehensive trip overview that will be used by specialized recommendation systems for flights, lodging, and ground transportation.

Generate a structured trip analysis that includes:
1. Trip profile and key considerations
2. Budget allocation breakdown
3. City-by-city stay recommendations (how many nights in each city)
4. Timeline and pacing suggestions
5. Group-specific considerations (families, seniors, mobility needs)
6. Transport mode strategy

Return ONLY valid JSON in this exact structure:
{
  "tripProfile": {
    "summary": "Brief 2-3 sentence overview of the trip character",
    "tripType": "budget-conscious" | "balanced" | "premium",
    "pace": "relaxed" | "moderate" | "packed",
    "primaryFocus": "matches" | "cultural-exploration" | "food-and-nightlife" | "family-friendly"
  },
  "budgetAllocation": {
    "totalEstimate": "$X,XXX - $X,XXX per person",
    "flights": "XX%",
    "lodging": "XX%",
    "ground": "XX%",
    "activities": "XX%"
  },
  "cityStays": [
    {
      "city": "Atlanta",
      "nights": 3,
      "purpose": "Opening match + explore",
      "arrivalDate": "2026-06-15",
      "departureDate": "2026-06-18",
      "priority": "high"
    }
  ],
  "groupConsiderations": {
    "accessibility": ["Specific needs based on mobility/seniors/children"],
    "accommodations": ["Type of lodging that works best"],
    "pacing": ["How to balance activities"]
  },
  "transportStrategy": {
    "intercity": "flights" | "trains" | "car-rental" | "mixed",
    "intracity": "public-transit" | "rideshare" | "car" | "mixed",
    "rationale": "Why this approach works for this group"
  },
  "keyRecommendations": [
    "3-5 bullet points of critical advice"
  ]
}`;

    const userPrompt = `Create a trip overview for the following traveler:

**Traveler Details:**
- Origin: ${formData.originCity}${formData.originAirport ? ` (${formData.originAirport.code} - ${formData.originAirport.name})` : ''}
- Group Size: ${formData.groupSize} adults${formData.children > 0 ? `, ${formData.children} children (ages 0-12)` : ''}${formData.seniors > 0 ? `, ${formData.seniors} seniors (65+)` : ''}
- Mobility Considerations: ${formData.mobilityIssues ? 'Yes - group has mobility limitations' : 'No special mobility needs'}
- Transport Mode Preference: ${formData.transportMode}
- Budget Level: ${formData.budgetLevel}
- Travel Dates: ${formData.startDate} to ${formData.endDate}
${formData.personalContext ? `- Special Context: ${formData.personalContext}` : ''}

**Cities & Stadiums:**
${cities?.map((city: any) => `
- ${city.name}, ${city.country}
  - Stadium: ${city.stadium_name}
  - Fan Festival: ${city.fan_fest_location}
  - Airport: ${city.airport_code}
`).join('\n')}

${cityContextPrompt}

Use the city guides above to inform your recommendations. Return ONLY the JSON structure specified.`;

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

    const overview = JSON.parse(jsonText);

    // Create or update trip session in database
    const tripContext = {
      ...formData,
      cities: cities || [],
      overview,
      generatedAt: new Date().toISOString()
    };

    // Check for existing session and create/update
    const { data: existingSessions } = await supabase
      .from('trip_sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    let sessionId: string;

    if (existingSessions && existingSessions.length > 0) {
      // Update existing session
      const { data: updated, error: updateError } = await supabase
        .from('trip_sessions')
        .update({ 
          trip_context: tripContext,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSessions[0].id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update trip session:', updateError);
        return NextResponse.json({ error: 'Failed to save trip data' }, { status: 500 });
      }

      sessionId = updated.id;
    } else {
      // Create new session
      const { data: created, error: createError } = await supabase
        .from('trip_sessions')
        .insert({
          user_id: user.id,
          trip_context: tripContext
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create trip session:', createError);
        return NextResponse.json({ error: 'Failed to save trip data' }, { status: 500 });
      }

      sessionId = created.id;
    }

    return NextResponse.json({ 
      success: true,
      sessionId,
      overview,
      message: 'Trip overview generated successfully. Ready for detailed recommendations.'
    });

  } catch (error) {
    console.error('Overview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip overview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
