import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';
import { createServerClient as createSSRClient } from '@supabase/ssr';

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

function normalizeProfileAirport(home?: UserProfile['home_airport'] | null) {
  if (!home?.code) return undefined;
  return {
    code: home.code,
    name: home.name || home.code,
    city: home.city || '',
    country: home.country || '',
  };
}

function mergeProfileDefaults(form: TravelPlanRequestV2, profile?: UserProfile | null): TravelPlanRequestV2 {
  const merged: TravelPlanRequestV2 = {
    ...form,
    citiesVisiting: [...form.citiesVisiting],
    tripFocus: Array.isArray(form.tripFocus) ? [...form.tripFocus] : [],
    matchDates: form.matchDates ? [...form.matchDates] : [],
    ticketCities: form.ticketCities ? [...form.ticketCities] : [],
  };

  if (!profile) {
    return merged;
  }

  const profileAirport = normalizeProfileAirport(profile.home_airport);
  if (!merged.originAirport && profileAirport) {
    merged.originAirport = profileAirport;
  }
  if (!merged.originCity) {
    merged.originCity = profile.home_city || profileAirport?.city || merged.originCity;
  }

  if (typeof profile.group_size === 'number' && profile.group_size > 0) {
    merged.groupSize = profile.group_size;
  }
  const kids = (profile.children_0_5 ?? 0) + (profile.children_6_18 ?? 0);
  merged.children = kids > 0 ? kids : (profile.children ?? merged.children);
  if (typeof profile.seniors === 'number') {
    merged.seniors = profile.seniors;
  }
  if (typeof profile.mobility_issues === 'boolean') {
    merged.mobilityIssues = merged.mobilityIssues || profile.mobility_issues;
  }
  if (profile.preferred_transport) {
    merged.transportMode = profile.preferred_transport as TravelPlanRequestV2['transportMode'];
  }
  if (profile.budget_level) {
    merged.budgetLevel = profile.budget_level as TravelPlanRequestV2['budgetLevel'];
  }
  if ((!merged.tripFocus || merged.tripFocus.length === 0) && Array.isArray(profile.travel_focus) && profile.travel_focus.length) {
    merged.tripFocus = profile.travel_focus as TravelPlanRequestV2['tripFocus'];
  }
  if (!merged.foodPreference && profile.food_preference) {
    merged.foodPreference = profile.food_preference as NonNullable<TravelPlanRequestV2['foodPreference']>;
  }
  if (!merged.nightlifePreference && profile.nightlife_preference) {
    merged.nightlifePreference = profile.nightlife_preference as NonNullable<TravelPlanRequestV2['nightlifePreference']>;
  }
  if (!merged.climatePreference && profile.climate_preference) {
    merged.climatePreference = profile.climate_preference as NonNullable<TravelPlanRequestV2['climatePreference']>;
  }

  const ticketCity = profile.ticket_match?.city?.trim();
  const ticketDate = profile.ticket_match?.date?.trim();
  if (ticketCity && (!merged.ticketCities || merged.ticketCities.length === 0)) {
    merged.ticketCities = [ticketCity];
  }
  if (ticketDate && (!merged.matchDates || merged.matchDates.length === 0)) {
    merged.matchDates = [ticketDate];
  }
  if (ticketCity && (!merged.citiesVisiting || merged.citiesVisiting.length === 0)) {
    merged.citiesVisiting = [ticketCity];
  }
  if (profile.has_tickets) {
    merged.hasMatchTickets = true;
  }
  if (!merged.startDate && ticketDate) {
    merged.startDate = ticketDate;
  }
  if (!merged.endDate && ticketDate) {
    merged.endDate = ticketDate;
  }

  return merged;
}

function buildProfileSummary(profile: UserProfile | null, merged: TravelPlanRequestV2) {
  if (!profile) return '';
  const lines: string[] = [];
  if (profile.home_airport?.code || profile.home_city) {
    lines.push(`- Home Base: ${profile.home_city || profile.home_airport?.city || merged.originCity || 'unspecified'} (${profile.home_airport?.code || 'IATA TBD'})`);
  }
  const kids05 = profile.children_0_5 ?? 0;
  const kids618 = profile.children_6_18 ?? 0;
  if (kids05 > 0 || kids618 > 0) {
    lines.push(`- Kids traveling: ${kids05} aged 0-5 and ${kids618} aged 6-18 — surface family-friendly lodging, calmer nightlife, and flexible transit.`);
  }
  if ((profile.seniors ?? 0) > 0) {
    lines.push(`- Seniors in group: ${profile.seniors} — include rest-friendly pacing and limited stair climbs.`);
  }
  if (profile.mobility_issues) {
    lines.push('- Mobility considerations: Yes — highlight accessible transit, elevators, and reduced walking routes.');
  }
  if (profile.budget_level) {
    lines.push(`- Baseline budget level: ${profile.budget_level}.`);
  }
  if (profile.preferred_transport) {
    lines.push(`- Preferred transport: ${profile.preferred_transport}.`);
  }
  if (profile.food_preference) {
    lines.push(`- Dining focus: ${profile.food_preference}.`);
  }
  if (profile.nightlife_preference) {
    lines.push(`- Nightlife vibe: ${profile.nightlife_preference}.`);
  }
  if (profile.climate_preference) {
    lines.push(`- Climate tolerance: ${profile.climate_preference}.`);
  }
  if (profile.has_tickets && profile.ticket_match) {
    const matchLabel = profile.ticket_match.match || 'Match';
    const matchCity = profile.ticket_match.city || 'host city';
    const matchDate = profile.ticket_match.date || merged.startDate || merged.endDate || 'date TBD';
    lines.push(`- Ticket commitment: ${matchLabel} in ${matchCity} on ${matchDate} — align the itinerary around this matchday.`);
  }
  if (!lines.length) return '';
  return `\nTraveler Profile Signals:\n${lines.join('\n')}\n`;
}
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';
import { filterMatches, groupByCity } from '@/lib/matchSchedule';
import type { UserProfile } from '@/lib/profile/types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

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
  personalContext?: string;
  // V2 additions
  hasMatchTickets: boolean;
  matchDates?: string[];
  ticketCities?: string[];
  tripFocus: Array<'fanfest' | 'local_culture' | 'stadium_experience' | 'nightlife' | 'unsure'>;
  surpriseMe?: boolean;
  comfortPreference?: 'budget_friendly' | 'balanced' | 'luxury_focus';
  nightlifePreference?: 'quiet' | 'social' | 'party';
  foodPreference?: 'local_flavors' | 'international' | 'mix';
  climatePreference?: 'all' | 'prefer_northerly' | 'comfortable';
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for premium planner API
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
    
    // Detect user's locale from request headers or formData
    const locale = formData.locale || request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en';
    const isSpanish = locale === 'es';
    
    const supabase = createServerClient();
    let profile: UserProfile | null = null;
    try {
      if (userId) {
        const { data: profileRow } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        profile = (profileRow || null) as UserProfile | null;
      }
    } catch (profileError) {
      console.warn('Failed to load user_profile row', profileError);
    }
    const mergedForm = mergeProfileDefaults(formData, profile);

    const { data: cities, error } = await supabase
      .from('cities')
      .select('name, stadium_name, stadium_lat, stadium_long, fan_fest_location, fan_fest_lat, fan_fest_long, airport_code, country')
      .in('name', mergedForm.citiesVisiting);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
    }

    // Optional: Load city-specific context files (our detailed travel guides)
    const USE_CITY_CONTEXT = process.env.PLANNER_USE_CITY_CONTEXT === 'true';
    let cityContextPrompt = '';
    if (USE_CITY_CONTEXT) {
      console.log('Loading city context for:', mergedForm.citiesVisiting);
      const cityContext = await loadCityContext(mergedForm.citiesVisiting, 'en');
      cityContextPrompt = formatCityContextForPrompt(cityContext);
      console.log('City context loaded:', Object.keys(cityContext).length, 'cities');
    } else {
      console.log('PLANNER_USE_CITY_CONTEXT is disabled; skipping city guide injection');
    }

    // Build a filtered match schedule for the user's cities and dates
    const knownMatches = groupByCity(
      filterMatches({
        cities: mergedForm.citiesVisiting,
        startDate: mergedForm.startDate,
        endDate: mergedForm.endDate
      })
    );

    const profileSummary = buildProfileSummary(profile, mergedForm);

    // Language instruction for AI
    const languageInstruction = isSpanish 
      ? '\n\n**IMPORTANTE: Responde en español. Todos los textos descriptivos, resúmenes, consejos, notas y etiquetas deben estar en español. Mantén los nombres propios de ciudades, estadios y aeropuertos en su forma original.**\n\n'
      : '';

    // Build the prompt for Gemini
    const prompt = `You are a senior World Cup 2026 travel planner.${languageInstruction}Using the traveler inputs and the "Cities & Stadiums" list, produce 2–3 distinct, realistic itinerary options that COVER ALL REQUIRED TRAVEL: origin → first city, inter-city moves, and last city → origin. Reflect the EXACT dates and ALL cities provided. If multiple cities are listed, you MUST include the movement between them (flight/train/car) consistent with Transport Mode.
\nCRITICAL: Every input city in [${mergedForm.citiesVisiting.join(', ')}] must appear in trip.cityOrder for each option. Do not omit any input city. Do not add cities that aren't requested (except for necessary layover hubs, which must NOT be listed in cityOrder).

Traveler Details:
- Origin: ${mergedForm.originCity}${mergedForm.originAirport ? ` (${mergedForm.originAirport.code} - ${mergedForm.originAirport.name})` : ''}
- Group Size: ${mergedForm.groupSize} adults${mergedForm.children > 0 ? `, ${mergedForm.children} children (ages 0-12)` : ''}${mergedForm.seniors > 0 ? `, ${mergedForm.seniors} seniors (65+)` : ''}
- Mobility Considerations: ${mergedForm.mobilityIssues ? 'Yes - group has mobility limitations' : 'No special mobility needs'}
- Transport Mode: ${mergedForm.transportMode}
- Budget Level: ${mergedForm.budgetLevel}
- Travel Dates: ${mergedForm.startDate} to ${mergedForm.endDate}
${mergedForm.personalContext ? `- Special Context: ${mergedForm.personalContext}` : ''}

Match Context:
- Has Match Tickets: ${mergedForm.hasMatchTickets ? 'Yes' : 'No'}
${mergedForm.matchDates && mergedForm.matchDates.length ? `- Match Dates: ${mergedForm.matchDates.join(', ')}` : ''}
${mergedForm.ticketCities && mergedForm.ticketCities.length ? `- Ticket Cities: ${mergedForm.ticketCities.join(', ')}` : ''}

Trip Focus & Preferences:
- Focus: ${Array.isArray(mergedForm.tripFocus) && mergedForm.tripFocus.length ? mergedForm.tripFocus.join(', ') : 'unspecified'}${mergedForm.surpriseMe ? ' (SurpriseMe enabled)' : ''}
${mergedForm.comfortPreference ? `- Comfort: ${mergedForm.comfortPreference}` : ''}
${mergedForm.nightlifePreference ? `- Nightlife: ${mergedForm.nightlifePreference}` : ''}
${mergedForm.foodPreference ? `- Food: ${mergedForm.foodPreference}` : ''}
${mergedForm.climatePreference ? `- Climate: ${mergedForm.climatePreference}` : ''}
${profileSummary}

Cities & Stadiums:
${cities?.map(city => `
- ${city.name}, ${city.country}
  - Stadium: ${city.stadium_name} (${city.stadium_lat}, ${city.stadium_long})
  - Fan Festival: ${city.fan_fest_location} (${city.fan_fest_lat}, ${city.fan_fest_long})
  - Airport: ${city.airport_code}
`).join('\n')}

Known Match Schedule (for selected cities within trip dates):
${Object.keys(knownMatches).length ? Object.entries(knownMatches).map(([city, list]) => {
      const lines = (list as any[]).map(m => `  - ${m.date}: ${m.match} @ ${m.stadium}`).join('\n');
      return `- ${city}:\n${lines}`;
    }).join('\n') : '- None found in this date range'}

## RULES OF EXECUTION

### 1️⃣ DATE & NIGHT CALCULATION
- Compute:
  - durationDays = number of calendar days from startDate to endDate inclusive.
  - totalNights = number of nights (endDate - startDate).
- Each itinerary must explicitly show arrival/departure per city.
  Example: “Arrive Dallas June 14 evening, Depart June 18 morning (4 nights).”
- The sum of all city nights MUST equal totalNights.
- Inter-city moves must occur on labeled “Day X” entries within the trip window.

### 2️⃣ FLIGHTS / INTER-CITY TRANSPORT
Cover ALL travel segments:
a) Origin → First City  
b) Every inter-city move (per transportMode)  
c) Last City → Origin  

Each flight or transport leg must include:
- Airlines (realistic carriers)
- Duration (“Xh Ym direct” or “Xh Ym with Zh layover in [city]”)
- Example local departure/arrival times
- Frequency (daily, 3x weekly, etc.)
- Layover duration (if applicable)
- Direct vs. connecting
- Notes (comfort tips or hub advice)
- Include a "costNote" key instead of totals, stating:  
  "Use the Flight Planner to view live pricing for these routes — estimated ranges are intentionally omitted here."

### 3️⃣ LODGING ZONES (REALISTIC, RANGE ONLY)
For each city:
- Include 2–3 neighborhoods or areas aligned with the traveler’s budgetLevel and mobility needs.
- Provide:
  - zoneName: neighborhood name.
  - whyStayHere: concise rationale (stadium proximity, transit, vibe, safety, atmosphere).
  - estimatedRate: nightly average range only (e.g., "$400–$550/night", June–July 2026 peak).
  - transitToStadium: mode + estimated duration.
  - transitToFanFest: mode + estimated duration.
  - pros and cons lists (each with 2–4 items).
- DO NOT calculate lodging totals or trip sums.
- Default nightly ranges:
  - Budget: $120–$220/night
  - Balanced: $180–$320/night
  - Premium: $300–$600+/night
- Focus on realistic and contextual guidance, not math.

### 4️⃣ MATCH DAY LOGISTICS & INSIDER TIPS
- Explain how to reach the stadium from the primary lodging zones (name the actual transit line or route).
- Include 3–4 insider tips focused on the World Cup fan experience.  
  Examples:
  - “AT&T Stadium is in Arlington—plan rideshare 45 mins before kickoff.”
  - “The KC Streetcar is free; use it daily to reach the Fan Fest.”
  - “Expect surge pricing; pre-book rideshare or group shuttle.”

### 5️⃣ PERSONALIZATION & CONTEXT
Factor in:
- Group composition (families, seniors, etc.)
- TransportMode (car, train, air)
- BudgetLevel
- MobilityConsiderations (accessibility priorities)
 - Match constraints: if hasMatchTickets = true, keep those cities/dates feasible and prioritize stadium logistics.
 - Trip Focus: reflect focus areas (e.g., fanfest, local culture, stadium experience, nightlife) in neighborhoods and activities.
 - Preferences: weave in comfort, nightlife vibe, cuisine, and climate tolerance where relevant.

Additionally, if matches exist in "Known Match Schedule", ensure at least one itinerary aligns with a plausible match attendance day in the relevant city and explicitly labels that day as "Match Day" with stadium transfer details.

### 6️⃣ OUTPUT STRUCTURE — JSON ONLY
Return valid JSON only, no text outside the object.  
Follow this exact schema:

{
  "tripSummary": {
    "origin": "${mergedForm.originCity}",
    "dates": { "start": "${mergedForm.startDate}", "end": "${mergedForm.endDate}" },
    "travelers": { "adults": ${mergedForm.groupSize}, "children": ${mergedForm.children}, "seniors": ${mergedForm.seniors} },
    "durationDays": <int>,
    "totalNights": <int>
  },
  "options": [
    {
      "title": "Balanced Fan Journey: Dallas Fan Fest & KC Match",
      "summary": "Brief overview of the itinerary focus and balance.",
      "trip": {
        "cityOrder": ["Dallas","Kansas City"],
        "nightsPerCity": { "Dallas": 5, "Kansas City": 4 },
        "interCityMoves": [
          { "day": "Day 6", "from": "Dallas", "to": "Kansas City", "mode": "flight", "estDuration": "1h 30m" }
        ]
      },
      "availableMatches": [
        { "city": "Dallas", "date": "2026-06-14", "match": "Match 11 Group F", "stadium": "AT&T Stadium" }
      ],
      "flights": {
        "legs": [
          {
            "from": "${mergedForm.originCity}${mergedForm.originAirport ? ` (${mergedForm.originAirport.code})` : ''}",
            "to": "Dallas (DFW)",
            "airlines": ["Japan Airlines","American Airlines"],
            "duration": "11h 30m direct",
            "exampleDeparture": "10:00",
            "exampleArrival": "08:30 (same day)",
            "frequency": "daily",
            "notes": "Direct flights preferred for comfort and time savings."
          },
          {
            "from": "Dallas (DFW)",
            "to": "Kansas City (MCI)",
            "airlines": ["American Airlines","Southwest"],
            "duration": "1h 30m direct",
            "exampleDeparture": "10:30",
            "exampleArrival": "12:00",
            "frequency": "5–7x daily"
          },
          {
            "from": "Kansas City (MCI)",
            "to": "${mergedForm.originCity}${mergedForm.originAirport ? ` (${mergedForm.originAirport.code})` : ''}",
            "airlines": ["American Airlines","United"],
            "duration": "16h with 2h layover in DFW",
            "exampleDeparture": "12:00",
            "exampleArrival": "19:30 (+1 day)",
            "frequency": "daily (via connecting hubs)"
          }
        ],
        "costNote": "Use the Flight Planner to view live pricing for these routes — estimated ranges are intentionally omitted here."
      },
      "cities": [
        {
          "cityName": "Dallas",
          "lodgingZones": [
            {
              "zoneName": "Downtown Dallas / Arts District",
              "whyStayHere": "Central access to DART Green Line and cultural attractions near Fair Park Fan Fest.",
              "estimatedRate": "$380–$500/night",
              "transitToStadium": "DART + World Cup Shuttle, 60–90 min total",
              "transitToFanFest": "DART Green Line, 10–15 min",
              "pros": ["Direct access to Fan Fest","Cultural attractions","Walkable","Safe"],
              "cons": ["Quiet at night","Requires transfer to stadium"]
            },
            {
              "zoneName": "Uptown / Victory Park",
              "whyStayHere": "Trendy, lively area near nightlife and DART Victory Station.",
              "estimatedRate": "$400–$550/night",
              "transitToStadium": "DART + rideshare 60–90 min",
              "transitToFanFest": "DART Green Line 15–20 min",
              "pros": ["Vibrant scene","Good transit","Close to downtown"],
              "cons": ["Pricier","Can be noisy"]
            }
          ],
          "matchDayLogistics": "Use DART to Victory Station → transfer to stadium shuttle; rideshare backup if late.",
          "insiderTips": ["AT&T Stadium is in Arlington","Pre-book rideshare","Stay hydrated at Fair Park","Use DART GoPass for convenience"]
        },
        {
          "cityName": "Kansas City",
          "lodgingZones": [
            {
              "zoneName": "Downtown / Power & Light District",
              "whyStayHere": "Lively area near Fan Fest, connected by free KC Streetcar.",
              "estimatedRate": "$300–$450/night",
              "transitToStadium": "Streetcar + Shuttle, 30–45 min",
              "transitToFanFest": "Streetcar direct, 5–10 min",
              "pros": ["Vibrant nightlife","Walkable","Safe"],
              "cons": ["Can be noisy","Shuttle required to stadium"]
            },
            {
              "zoneName": "Crossroads Arts District",
              "whyStayHere": "Creative neighborhood with great restaurants and galleries.",
              "estimatedRate": "$280–$420/night",
              "transitToStadium": "Streetcar + Shuttle, 30–45 min",
              "transitToFanFest": "Streetcar direct, 5–10 min",
              "pros": ["Unique atmosphere","Less crowded"],
              "cons": ["Quieter at night","Transit required to stadium"]
            }
          ],
          "matchDayLogistics": "Take KC Streetcar south to Union Station → World Cup Shuttle to Arrowhead Stadium.",
          "insiderTips": ["Arrive early for tailgating","Try KC BBQ","Pre-book rideshare","Expect hot weather"]
        }
      ],
      "notes": "All lodging prices shown are nightly averages for June–July 2026; totals and group estimates are intentionally omitted."
    }
  ],
  "cta": {
    "title": "Ready to refine your trip?",
    "description": "Use the World Cup Fan Zone planning suite to customize every leg with live data.",
    "options": [
      {
        "name": "🧭 Trip Builder",
        "text": "Capture your travel profile and compare curated itineraries.",
        "link": "https://worldcupfanzone.com/planner/trip-builder"
      },
      {
        "name": "✈️ Flight Planner",
        "text": "See live routes, schedules, and fares for your chosen cities.",
        "link": "https://worldcupfanzone.com/flight-planner"
      },
      {
        "name": "🏨 Lodging Planner",
        "text": "Score the best-fit neighborhoods with commute times and budgets.",
        "link": "https://worldcupfanzone.com/lodging-planner"
      }
    ],
    "note": "Each planner layers your saved profile with fresh availability and pricing."
  }
}

- Every input city must appear in cityOrder for each option.
- The option summary should naturally reflect the cities covered.
- Include all required travel legs (outbound, inter-city, return).
- Sum of nightsPerCity = totalNights.
- Must reflect June–July 2026 context.
- Return only valid JSON.
\nBefore finalizing JSON, self-check: for each option, ensure trip.cityOrder contains ALL of [${mergedForm.citiesVisiting.join(', ')}]. If any are missing, revise that option to include the missing city with realistic nights and inter-city moves. Do not invent non-requested destinations.

${USE_CITY_CONTEXT ? cityContextPrompt : ''}

${USE_CITY_CONTEXT ? '**CRITICAL:** Use the authoritative city guides above as primary references when relevant. Do not contradict the guides.' : 'Use your own up-to-date knowledge. Prefer realistic airlines, routes, neighborhoods, and costs. Avoid hallucinations; if uncertain, provide typical ranges and clearly label estimates.'}`;

    // Call Gemini API
    // Use gemini-2.5-flash (fast and cost-effective for this API key)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response (strip markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const itinerary = JSON.parse(jsonText);

    // Save to database (optional - for tracking)
    const { error: saveError } = await supabase
      .from('travel_plans')
      .insert({
        origin_city: mergedForm.originCity || mergedForm.originAirport?.city || null,
        origin_airport: mergedForm.originAirport || null,
        group_size: mergedForm.groupSize,
        children: mergedForm.children,
        seniors: mergedForm.seniors,
        mobility_issues: mergedForm.mobilityIssues,
        transport_mode: mergedForm.transportMode,
        budget_level: mergedForm.budgetLevel,
        trip_focus: mergedForm.tripFocus ?? [],
        cities_visiting: mergedForm.citiesVisiting,
        has_match_tickets: mergedForm.hasMatchTickets,
        match_dates: mergedForm.matchDates ?? [],
        ticket_cities: mergedForm.ticketCities ?? [],
        personal_context: mergedForm.personalContext || null,
        surprise_me: mergedForm.surpriseMe ?? false,
        food_preference: mergedForm.foodPreference || null,
        nightlife_preference: mergedForm.nightlifePreference || null,
        climate_preference: mergedForm.climatePreference || null,
        start_date: mergedForm.startDate || null,
        end_date: mergedForm.endDate || null,
        itinerary,
        user_id: userId,
      });

    if (saveError) {
      console.error('Failed to save travel plan:', saveError);
      // Don't fail the request if saving fails
    }

    return NextResponse.json({ success: true, itinerary });

  } catch (error) {
    console.error('Travel planner error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
