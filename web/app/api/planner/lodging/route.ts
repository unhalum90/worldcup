import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';
import { supabase as clientSupabase } from '@/lib/supabaseClient';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get latest trip context
    const supabase = createServerClient();
    const { data: session, error: sessionError } = await supabase
      .from('trip_sessions')
      .select('trip_context, id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No trip session found. Please create an overview first.' }, { status: 404 });
    }

    const tripContext = session.trip_context;

    // 3. Load city-specific lodging guides
    console.log('Loading city context for lodging:', tripContext.citiesVisiting);
    const cityContext = await loadCityContext(tripContext.citiesVisiting, 'en');
    const cityContextPrompt = formatCityContextForPrompt(cityContext);

    // 4. Build lodging prompt
    const prompt = `You are a lodging specialist for World Cup 2026 travel. Use the detailed city guides below to generate specific neighborhood and hotel recommendations.

${cityContextPrompt}

**CRITICAL:** Use the authoritative city guides above as your PRIMARY source of truth. These guides contain verified, detailed information about lodging zones, neighborhoods, transit access, and insider tips that you MUST incorporate into your recommendations.

**Trip Context:**
${JSON.stringify(tripContext.overview, null, 2)}

**Group:** ${tripContext.groupSize} adults${tripContext.children > 0 ? `, ${tripContext.children} children` : ''}${tripContext.seniors > 0 ? `, ${tripContext.seniors} seniors` : ''}
**Mobility:** ${tripContext.mobilityIssues ? 'Has mobility limitations - prioritize accessible areas' : 'No special needs'}
**Transport:** ${tripContext.transportMode}
**Budget:** ${tripContext.budgetLevel}

**Task:**
For EACH city in the trip (${tripContext.citiesVisiting.join(', ')}), provide:

1. **Top 3 lodging zones/neighborhoods** with:
   - Specific neighborhood name (from city guide)
   - Why it's recommended for this group
   - Transit access to stadium and fan festival (metro lines, bus routes, travel times)
   - Typical hotel/Airbnb price per night for this budget level
   - Walking score and safety rating
   - Pros and cons
   - Specific hotel examples (if mentioned in guide)

2. **Match day logistics** from each zone:
   - How to get to stadium (specific transit lines/routes from city guide)
   - Travel time
   - Pre/post-game dining/entertainment nearby

3. **Insider tips** from the city guide about:
   - Areas to avoid
   - Best booking timing
   - Local accommodation quirks

Return JSON:
{
  "cities": [
    {
      "city_name": string,
      "zones": [
        {
          "neighborhood": string,
          "reason": string,
          "transit_to_stadium": string,
          "transit_to_fan_fest": string,
          "price_per_night": string,
          "walking_score": string,
          "safety_rating": string,
          "pros": string[],
          "cons": string[],
          "hotel_examples": string[]
        }
      ],
      "match_day_logistics": string,
      "insider_tips": string[]
    }
  ]
}`;

    // 5. Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const lodgingData = JSON.parse(jsonMatch[0]);

    // 6. Update trip_sessions with lodging data
    const { error: updateError } = await supabase
      .from('trip_sessions')
      .update({
        lodging_data: lodgingData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Failed to save lodging data:', updateError);
      return NextResponse.json({ error: 'Failed to save lodging recommendations' }, { status: 500 });
    }

    // 7. Return lodging data
    return NextResponse.json({
      success: true,
      session_id: session.id,
      lodging: lodgingData,
    });

  } catch (error) {
    console.error('Lodging generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lodging recommendations' },
      { status: 500 }
    );
  }
}
