import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
    // 1. Create Supabase client with cookies for auth
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: async (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: async () => {},
          removeItem: async () => {},
        },
      },
    });

    // 2. Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const formData: OverviewRequest = await request.json();

    // 3. Fetch city data from database
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('name, stadium_name, stadium_lat, stadium_long, fan_fest_location, fan_fest_lat, fan_fest_long, airport_code, country')
      .in('name', formData.citiesVisiting);

    if (citiesError) {
      console.error('Database error:', citiesError);
      return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
    }

    // 3. Build trip overview prompt
    const prompt = `You are a World Cup 2026 travel planning assistant. Create a high-level trip overview based on these preferences:

**Traveler Profile:**
- Origin: ${formData.originCity}${formData.originAirport ? ` (${formData.originAirport.code})` : ''}
- Group: ${formData.groupSize} adults${formData.children > 0 ? `, ${formData.children} children` : ''}${formData.seniors > 0 ? `, ${formData.seniors} seniors` : ''}
- Mobility: ${formData.mobilityIssues ? 'Has mobility limitations' : 'No special needs'}
- Transport: ${formData.transportMode}
- Budget: ${formData.budgetLevel}
- Dates: ${formData.startDate} to ${formData.endDate}
${formData.personalContext ? `- Notes: ${formData.personalContext}` : ''}

**Cities to Visit:**
${cities?.map(city => `- ${city.name}, ${city.country} (${city.stadium_name}, Airport: ${city.airport_code})`).join('\n')}

**Task:**
Generate a strategic trip overview with:
1. Suggested trip duration and pacing
2. Recommended city visit order (based on geography and logistics)
3. Key considerations for this specific group
4. Budget overview (flights, lodging, daily expenses)
5. Important notes about timing, transport, and accessibility

Return JSON in this format:
{
  "duration_days": number,
  "suggested_route": ["City1", "City2", ...],
  "group_considerations": string[],
  "estimated_budget": {
    "flights_total": string,
    "lodging_per_night": string,
    "daily_expenses": string,
    "total_estimate": string
  },
  "key_notes": string[],
  "summary": "2-3 sentence trip overview"
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
    const overview = JSON.parse(jsonMatch[0]);

    // 5. Create trip_context object
    const tripContext = {
      ...formData,
      cities: cities || [],
      overview,
      created_at: new Date().toISOString(),
    };

    // 6. Save to trip_sessions table
    const { data: session, error: sessionError } = await supabase
      .from('trip_sessions')
      .upsert({
        user_id: user.id,
        trip_context: tripContext,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session save error:', sessionError);
      return NextResponse.json({ error: 'Failed to save trip session' }, { status: 500 });
    }

    // 7. Return overview
    return NextResponse.json({
      success: true,
      session_id: session.id,
      overview,
      trip_context: tripContext,
    });

  } catch (error) {
    console.error('Overview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip overview' },
      { status: 500 }
    );
  }
}
