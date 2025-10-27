import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const supabaseAuth = createSSRClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
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

    const body = await req.json();
    const selection = body.selection;
    if (!selection?.option) {
      return NextResponse.json({ error: 'Missing itinerary selection' }, { status: 400 });
    }

    // Detect user's locale
    const locale = body.locale || req.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en';
    const isSpanish = locale === 'es';

    const adjustments = body.adjustments || {};
    const supabase = createServerClient();
    const { data: profileRow } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    const cities = Array.from(new Set<string>([
      ...(selection.option.trip?.cityOrder || []),
      ...selection.option.cities.map((c: any) => c.cityName),
      ...((selection.tripInput?.citiesVisiting) || []),
    ]));
    const cityContext = await loadCityContext(cities);
    const cityContextPrompt = formatCityContextForPrompt(cityContext);

    const prompt = buildPrompt(selection, adjustments, profileRow, cityContextPrompt, isSpanish);

    let responseJson: FlightPlanResponse | null = null;
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      const result = await model.generateContent(prompt);
      const text = cleanJSON(result.response.text());
      try {
        responseJson = JSON.parse(text);
      } catch (err) {
        console.warn('Failed to parse Gemini response, falling back to stub', err);
      }
    }

    if (!responseJson) {
      responseJson = buildFallbackPlan(selection);
    }

    return NextResponse.json({ plan: responseJson });
  } catch (err: any) {
    console.error('Flight planner error', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate flight plan' },
      { status: 500 }
    );
  }
}

function buildPrompt(selection: any, adjustments: any, profile: any, cityContextPrompt: string, isSpanish: boolean = false) {
  const cabin = adjustments.cabin || 'economy';
  const travelers = adjustments.travelers || profile?.group_size || 1;
  const allowOvernight = adjustments.allowOvernight ? 'Yes' : 'Prefer daytime flights';
  const maxStops = adjustments.maxStops || '1';
  const cityOrder = selection.option.trip?.cityOrder?.join(' → ') || selection.option.cities.map((c: any) => c.cityName).join(' → ');
  const legs = (selection.option.flights?.legs || []).map((leg: any) => `${leg.from} → ${leg.to} (${leg.duration || 'duration TBD'})`).join('\n');

  // Language instruction for AI
  const languageInstruction = isSpanish 
    ? '\n\n**IMPORTANTE: Responde en español. Todos los textos descriptivos, consejos, notas, etiquetas y explicaciones deben estar en español. Mantén los códigos de aerolíneas, aeropuertos y números de vuelo en su forma original.**\n\n'
    : '';

  return `
You are the World Cup 2026 Flight Planner.${languageInstruction}The traveler selected this itinerary:
Title: ${selection.option.title}
Summary: ${selection.option.summary}
Cities: ${cityOrder}
Trip Dates: ${selection.tripInput?.startDate || 'TBD'} to ${selection.tripInput?.endDate || 'TBD'}

Existing flight outline from Trip Builder:
${legs || 'Not provided; derive flights from the city order.'}

Traveler profile highlights:
- Home airport: ${profile?.home_airport?.code || 'Unknown'}
- Group size: ${profile?.group_size || 'Not set'}
- Children: ${(profile?.children || 0) > 0 ? profile.children : 'None'}
- Budget level: ${profile?.budget_level || 'moderate'}
- Preferred transport: ${profile?.preferred_transport || 'mixed'}
- Has match tickets: ${profile?.has_tickets ? 'Yes' : 'No'}

Flight Planner preferences:
- Cabin class: ${cabin}
- Travelers: ${travelers}
- Allow overnight: ${allowOvernight}
- Max stops: ${maxStops}

${cityContextPrompt}

TASK:
Produce JSON only (no prose) with this shape:
{
  "generatedAt": "ISO timestamp",
  "summary": {
    "travelerProfile": "1-2 sentences about the traveler",
    "note": "General note about availability/pricing"
  },
  "options": [
    {
      "label": "Smartest Option",
      "tagline": "Short sentence",
      "suitability": "Why this option fits",
      "keyBenefits": ["bullet", "..."],
      "flights": [
        {
          "route": "LIS → MIA",
          "airlines": ["Azores Airlines","TAP"],
          "duration": "8h 15m direct",
          "estPrice": "$820–$910 pp (economy)",
          "layover": "Optional layover detail",
          "bookingTips": "Concise booking advice",
          "exampleFlight": "TP 207 (depart 11:45 AM, arrive 3:20 PM)"
        }
      ],
      "alternateAirports": ["YYZ for better pricing", "..."],
      "groundTransport": ["Uber/Lyft 45 min to stadium", "..."]
    },
    {
      "label": "Budget Option",
      ...
    },
    {
      "label": "Fastest Option",
      ...
    }
  ],
  "reminders": [
    "Short reminder bullet",
    "Another reminder"
  ]
}

RULES:
- Smartest = balance between comfort and convenience.
- Budget = cheapest fares, accept longer routes or low-cost carriers.
- Fastest = minimum travel time, even if costlier.
- Include specific example flights with real airline codes and flight numbers when possible.
- Include alternate airport advice referencing the city context when useful.
- Mention when to book, baggage limits, or visa/transit reminders when relevant.
- For booking timing: International flights typically open 9 months in advance (not 12-18 months).
- Never mention pricing APIs or internal tooling; keep it traveler-facing.
`;
}

function cleanJSON(text: string) {
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }
  return jsonText;
}

function buildFallbackPlan(selection: any): FlightPlanResponse {
  const hostCities: string[] = selection.option.trip?.cityOrder?.length
    ? selection.option.trip.cityOrder
    : selection.option.cities.map((c: any) => c.cityName);
  const interCityLabel = hostCities.length ? hostCities.join(' → ') : 'World Cup host cities';
  const firstHost = hostCities[0] || 'Primary host city';
  const secondHost = hostCities[1] || hostCities[0] || 'Secondary host city';
  const originCity = selection.tripInput?.originCity || 'Home city';

  const smartestOption: FlightPlanOption = {
    label: 'Smartest Option',
    tagline: '11-hour door-to-door with predictable ATL layover',
    suitability: 'Best blend of reliability and total travel time for most families.',
    connectionCity: 'ATL (Delta + Air France partners)',
    reliabilityNote: '2h buffer at ATL keeps immigration + recheck manageable even during peak tournament days.',
    familyTip: 'Delta/Air France allow complimentary stroller + car seat check; request bulkhead for bassinets.',
    keyBenefits: [
      'Single alliance ticket keeps bags checked through',
      'ATL SkyDeck + CLEAR expedite long connections',
      'Arrive evening local time to align with Fan Fest kickoffs',
    ],
    flights: [
      {
        route: `${originCity} → ${firstHost} (via ATL)`,
        airlines: ['Delta', 'Air France partner'],
        duration: '11h total • 2h ATL layover',
        estPrice: '$1,900–$2,500 roundtrip (per traveler)',
        layover: 'ATL, Concourse F — easy same-terminal connection',
        bookingTips: 'Book as a multi-city fare and choose Comfort+ for extra legroom on the overnight segment.',
        exampleFlight: 'DL 142 (depart 6:15 PM) → DL 1837 (arrive 9:45 AM+1)',
      },
      {
        route: `${firstHost} → ${secondHost} (${interCityLabel})`,
        airlines: ['American', 'Alaska codeshare'],
        duration: '2h 15m daytime hop',
        estPrice: '$180–$260 pp',
        bookingTips: 'Use the airline app to tag bags straight through to the next host city.',
        exampleFlight: 'AA 3420 (depart 2:10 PM, arrive 4:25 PM)',
      },
    ],
    alternateAirports: [`If ${originCity} has limited lift, check JFK/EWR for alliance seats.`],
    groundTransport: ['Use official World Cup shuttles from ATL-intl arrivals to MARTA if self-booking extra nights.'],
  };

  const budgetOption: FlightPlanOption = {
    label: 'Budget Option',
    tagline: 'Overnight ORD layover with low-cost connectors',
    suitability: 'Great when minimizing fare is worth an extra layover or late-night arrival.',
    connectionCity: 'ORD (United + partner LCC mix)',
    reliabilityNote: 'Allow 3h at ORD; winter weather diversions are rare in June but crowds spike.',
    familyTip: 'Bring collapsible snacks + refillable bottles—budget carriers charge for everything onboard.',
    keyBenefits: [
      'Capitalizes on secondary airports and fare sales',
      'Free 23kg checked bag on United long-haul when booked with card benefits',
      'ORD overnight lets you reset and shower at the Polaris lounge if upgraded',
    ],
    flights: [
      {
        route: `${originCity} → ${firstHost} (via ORD)`,
        airlines: ['United', 'Air Canada Rouge'],
        duration: '14–16h total • 5h overnight layover',
        estPrice: '$1,600–$2,100 total (two travelers)',
        layover: 'ORD Terminal 1 ➝ Terminal 5 (allow 45 min transfer)',
        bookingTips: 'Pack a carry-on pillow/blanket and pre-book an airport micro-hotel for the overnight gap.',
        exampleFlight: 'UA 971 (depart 11:30 PM) → AC 8935 (arrive 2:15 PM+1)',
      },
    ],
    alternateAirports: ['Look at BWI + EWR for cheaper East Coast hops into Philadelphia/New York clusters.'],
    groundTransport: ['EWR → Philly: NJ Transit + SEPTA combo ~2h / $40', 'BWI → DC/Philly: Amtrak Northeast Regional ~1.5h / $60'],
  };

  const fastestOption: FlightPlanOption = {
    label: 'Fastest Option',
    tagline: 'Premium nonstop or 1-stop via JFK/CDG',
    suitability: 'Ideal when time is scarce and you value lie-flat or priority services.',
    connectionCity: 'JFK or CDG (SkyTeam + oneworld premium cabins)',
    reliabilityNote: 'Short 70–90 min layovers — book through-ticket to protect against misconnects.',
    familyTip: 'Use priority boarding for kids and request bulkhead bassinets; premium fares include lounge access for downtime.',
    keyBenefits: [
      'Lie-flat overnight segment arrives rested for match day',
      'Fast-track security and immigration bundled with premium fares',
      'Most routes earn 1.5x qualifying miles for status chasers',
    ],
    flights: [
      {
        route: `${originCity} → ${firstHost} nonstop / 1-stop premium`,
        airlines: ['American Flagship', 'Air France La Première'],
        duration: '9h 45m door-to-door',
        estPrice: '$2,500–$3,200 pp (business class)',
        layover: 'If required, 1h15 at JFK T8 with Flagship Lounge shower suites',
        bookingTips: 'Redeem 57.5k–70k AAdvantage or Flying Blue miles for business saver space.',
        exampleFlight: 'AA 729J (depart 7:50 PM nonstop, arrive 7:35 AM+1)',
      },
      {
        route: `${interCityLabel} return to ${originCity}`,
        airlines: ['Delta One', 'Air France'],
        duration: 'Return timed for Monday morning arrivals',
        estPrice: 'Included in premium fare above',
        bookingTips: 'Schedule return 24h after final match to hedge against extra time / transit delays.',
        exampleFlight: 'DL 263J (depart 10:15 AM, arrive 11:20 AM same day)',
      },
    ],
    alternateAirports: ['Try BOS/JFK for additional premium-cabin award space.'],
    groundTransport: ['Private transfer or rideshare budget: $60–$90 each stadium day for door-to-door timing.'],
  };

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      travelerProfile: `${selection.tripInput?.groupSize || 1} traveler plan anchored to ${interCityLabel}.`,
      note: 'Live pricing varies by departure city. Use these templates in the Flight Planner to refresh fares weekly.',
    },
    options: [smartestOption, budgetOption, fastestOption],
    sharedGroundNotes: [
      'SEPTA Regional Rail + Fan Fest shuttles handle most Philadelphia match days — load funds to SEPTA Key.',
      'Reserve official FIFA shuttles or KC Streetcar connectors 24h in advance when bouncing between hosts.',
    ],
    reminders: [
      'Book flights 6-9 months in advance when international schedules open - not earlier as most airlines don\'t release seats beyond 9 months.',
      'Combine packing/visa prep under one checklist so passports, ESTA/eTA, and match tickets stay together.',
      'Add trip insurance that covers delay + rebooking fees — tournament congestion can ripple across hubs.',
    ],
  };
}

type FlightPlanOption = {
  label: string;
  tagline: string;
  suitability: string;
  keyBenefits: string[];
  flights: Array<{
    route: string;
    airlines: string[];
    duration: string;
    estPrice: string;
    layover?: string;
    bookingTips?: string;
    exampleFlight?: string;
  }>;
  alternateAirports?: string[];
  groundTransport?: string[];
  connectionCity?: string;
  reliabilityNote?: string;
  familyTip?: string;
};

type FlightPlanResponse = {
  generatedAt: string;
  summary: {
    travelerProfile: string;
    note: string;
  };
  options: FlightPlanOption[];
  reminders: string[];
  sharedGroundNotes?: string[];
};
