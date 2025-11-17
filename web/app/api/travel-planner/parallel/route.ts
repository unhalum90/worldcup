import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import type { UserProfile } from '@/lib/profile/types';

function normalizeToHttps(u: string): string {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return u.replace(/^http:\/\//i, 'https://');
  }
}

interface TravelPlanRequestV2 {
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
  hasMatchTickets: boolean;
  matchDates?: string[];
  ticketCities?: string[];
  tripFocus?: string[];
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    let userId: string | null = null;
    try {
      const supabaseAuth = createSSRClient(
        normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set() {},
            remove() {},
          },
        }
      );
      const { data } = await supabaseAuth.auth.getUser();
      if (!data.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = data.user.id;
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData: TravelPlanRequestV2 = await request.json();
    const locale = formData.locale || 'en';
    
    const supabase = createServerClient();
    
    // Fetch cities and profile in parallel
    const [citiesResult, profileResult] = await Promise.all([
      supabase
        .from('cities')
        .select('name, stadium_name, stadium_lat, stadium_long, fan_fest_location, fan_fest_lat, fan_fest_long, airport_code, country')
        .in('name', formData.citiesVisiting),
      userId ? supabase.from('user_profile').select('*').eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null })
    ]);

    if (citiesResult.error) {
      console.error('Database error:', citiesResult.error);
      return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
    }

    const cities = citiesResult.data || [];
    const profile = (profileResult.data || null) as UserProfile | null;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start async parallel processing
    (async () => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress',
          message: 'Starting parallel AI processing...',
          progress: 5
        })}\n\n`));

        // Calculate nights per city (simplified distribution)
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const totalNights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const nightsPerCity = Math.max(1, Math.floor(totalNights / formData.citiesVisiting.length));
        
        // Step 1: Generate flight routing (focused, fast)
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress',
          message: 'Planning flight routes...',
          progress: 15
        })}\n\n`));

        const flightResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/travel-planner/flight-routing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originCity: formData.originCity,
            originAirport: formData.originAirport,
            cities,
            cityOrder: formData.citiesVisiting,
            transportMode: formData.transportMode,
            startDate: formData.startDate,
            endDate: formData.endDate,
            groupSize: formData.groupSize,
            locale
          })
        });

        if (!flightResponse.ok) {
          throw new Error('Failed to generate flight routing');
        }

        const flightPlan = await flightResponse.json();

        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress',
          message: 'Analyzing lodging zones in all cities...',
          progress: 35
        })}\n\n`));

        // Step 2: Process all cities in parallel
        const cityPromises = formData.citiesVisiting.map(async (cityName, index) => {
          const cityData = cities.find((c: any) => c.name === cityName);
          if (!cityData) {
            throw new Error(`City data not found for ${cityName}`);
          }

          const matchDate = formData.matchDates && formData.matchDates[index];
          const hasMatchTicket = formData.hasMatchTickets && formData.ticketCities?.includes(cityName);

          const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/travel-planner/city-details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cityName,
              cityData,
              budgetLevel: formData.budgetLevel,
              groupSize: formData.groupSize,
              children: formData.children,
              seniors: formData.seniors,
              mobilityIssues: formData.mobilityIssues,
              nightsInCity: nightsPerCity,
              hasMatchTicket,
              matchDate,
              tripFocus: formData.tripFocus,
              locale
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to generate details for ${cityName}`);
          }

          return response.json();
        });

        const cityDetails = await Promise.all(cityPromises);

        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress',
          message: 'Assembling your complete itinerary...',
          progress: 85
        })}\n\n`));

        // Step 3: Assemble final itinerary
        const itinerary = {
          tripSummary: {
            origin: formData.originCity,
            dates: { start: formData.startDate, end: formData.endDate },
            travelers: { 
              adults: formData.groupSize, 
              children: formData.children, 
              seniors: formData.seniors 
            },
            durationDays: totalNights + 1,
            totalNights
          },
          options: [{
            title: `${formData.citiesVisiting.join(' & ')} World Cup Adventure`,
            summary: `Optimized itinerary covering ${formData.citiesVisiting.join(', ')} with ${totalNights} nights total.`,
            trip: {
              cityOrder: formData.citiesVisiting,
              nightsPerCity: formData.citiesVisiting.reduce((acc, city) => {
                acc[city] = nightsPerCity;
                return acc;
              }, {} as Record<string, number>),
              interCityMoves: formData.citiesVisiting.slice(0, -1).map((from, i) => ({
                day: `Day ${(i + 1) * nightsPerCity + 1}`,
                from,
                to: formData.citiesVisiting[i + 1],
                mode: formData.transportMode === 'car' ? 'car' : 'flight',
                estDuration: '2-4h'
              }))
            },
            flights: flightPlan,
            cities: cityDetails
          }]
        };

        // Save to database
        await supabase.from('travel_plans').insert({
          origin_city: formData.originCity || formData.originAirport?.city || null,
          origin_airport: formData.originAirport || null,
          group_size: formData.groupSize,
          children: formData.children,
          seniors: formData.seniors,
          mobility_issues: formData.mobilityIssues,
          transport_mode: formData.transportMode,
          budget_level: formData.budgetLevel,
          trip_focus: formData.tripFocus ?? [],
          cities_visiting: formData.citiesVisiting,
          has_match_tickets: formData.hasMatchTickets,
          match_dates: formData.matchDates ?? [],
          ticket_cities: formData.ticketCities ?? [],
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          itinerary,
          user_id: userId,
        });

        // Send complete result
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete',
          itinerary
        })}\n\n`));
        
      } catch (error) {
        console.error('Parallel processing error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error',
          error: error instanceof Error ? error.message : 'Failed to generate itinerary'
        })}\n\n`));
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Travel planner error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
