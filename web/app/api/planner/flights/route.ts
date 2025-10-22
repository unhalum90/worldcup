import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // 1. Create Supabase client with proper SSR support
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // 2. Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    // 3. Get latest trip context
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

    // 3. Build flights prompt
    const prompt = `You are a flight routing specialist for World Cup 2026 travel. Generate detailed flight recommendations based on this trip context:

**Trip Overview:**
${JSON.stringify(tripContext.overview, null, 2)}

**Origin:** ${tripContext.originCity} ${tripContext.originAirport ? `(${tripContext.originAirport.code} - ${tripContext.originAirport.name})` : ''}
**Destinations:** ${tripContext.citiesVisiting.join(', ')}
**Dates:** ${tripContext.startDate} to ${tripContext.endDate}
**Group:** ${tripContext.groupSize} adults${tripContext.children > 0 ? `, ${tripContext.children} children` : ''}
**Budget:** ${tripContext.budgetLevel}

**Task:**
Generate 2-3 flight routing options (e.g., "Budget Option", "Balanced Option", "Premium Option") with:

For each option:
1. **Complete flight itinerary** from origin through all cities back to origin
2. **Each flight leg** should include:
   - Airline(s) (realistic carriers for this route)
   - Departure/arrival airports
   - Flight duration (e.g., "3h 15m direct" or "5h 40m with 1h 20m layover in Atlanta")
   - Typical departure/arrival times (be realistic)
   - Direct or connection
   - Frequency (daily, 3x/week, etc.)
3. **Multi-city routing strategy** (e.g., open-jaw, circle route, backtrack)
4. **Total cost estimate** for all flights
5. **Booking tips** (best time to book, airline alliances, etc.)

Return JSON:
{
  "options": [
    {
      "name": string,
      "total_cost": string,
      "routing_strategy": string,
      "legs": [
        {
          "from": string,
          "to": string,
          "airline": string,
          "duration": string,
          "departure_time": string,
          "arrival_time": string,
          "is_direct": boolean,
          "layover_info": string | null,
          "frequency": string,
          "estimated_cost": string
        }
      ],
      "booking_tips": string[],
      "pros": string[],
      "cons": string[]
    }
  ],
  "general_advice": string[]
}`;

    // 4. Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const flightsData = JSON.parse(jsonMatch[0]);

    // 5. Update trip_sessions with flights data
    const { error: updateError } = await supabase
      .from('trip_sessions')
      .update({
        flights_data: flightsData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Failed to save flights data:', updateError);
      return NextResponse.json({ error: 'Failed to save flight recommendations' }, { status: 500 });
    }

    // 6. Return flights data
    return NextResponse.json({
      success: true,
      session_id: session.id,
      flights: flightsData,
    });

  } catch (error) {
    console.error('Flights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flight recommendations' },
      { status: 500 }
    );
  }
}
