import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadCityContext, formatCityContextForPrompt } from '@/lib/loadCityContext';
import { loadZoneReports, type LodgingZone } from '@/lib/lodging/loadZoneReports';
import type { LodgingPlannerPlan, LodgingPlannerPreferences, LodgingPlannerRequestBody, LodgingZoneComparison, LodgingMapMarker } from '@/types/lodging';
import type { StoredSelection } from '@/types/trip';
import type { UserProfile } from '@/lib/profile/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

const DEFAULT_PREFERENCES: LodgingPlannerPreferences = {
  nightlyBudget: 225,
  nights: 4,
  carRental: false,
  multipleMatches: false,
  travelingWithFamily: false,
  weights: {
    stadiumProximity: 65,
    localCulture: 80,
    walkability: 70,
    nightlife: 55,
    budgetSensitivity: 60,
  },
};

const FALLBACK_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Guadalajara: { lat: 20.6736, lng: -103.344 },
};

const FALLBACK_ZONE_COORDS: Record<string, Record<string, { lat: number; lng: number }>> = {
  Guadalajara: {
    'Centro Histórico': { lat: 20.6767, lng: -103.3473 },
    'Zona Minerva / Chapultepec': { lat: 20.6769, lng: -103.3923 },
    'Zapopan / Stadium Area': { lat: 20.703, lng: -103.462 },
    Tlaquepaque: { lat: 20.6401, lng: -103.2933 },
    'Airport Area': { lat: 20.523, lng: -103.311 },
  },
};

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

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = createSSRClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
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
    const { data: authData } = await supabaseAuth.auth.getUser();
    const user = authData.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as LodgingPlannerRequestBody;
    if (!body?.selection?.option) {
      return NextResponse.json({ error: 'Missing itinerary selection' }, { status: 400 });
    }

    const focusCity = resolveFocusCity(body.selection);
    if (!focusCity) {
      return NextResponse.json({ error: 'Unable to determine focus city from selection' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: profileRow } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const normalizedPreferences = normalizePreferences(body.preferences, body.selection);
    const cityContext = await loadCityContext([focusCity], normalizedPreferences.language || 'en');
    const cityContextPrompt = formatCityContextForPrompt(cityContext);
    const zoneReport = await loadZoneReports(focusCity, normalizedPreferences.language || 'en');

    const prompt = buildPrompt({
      city: focusCity,
      selection: body.selection,
      preferences: normalizedPreferences,
      profile: profileRow,
      zoneReport,
      cityContextPrompt,
    });

    let plan: LodgingPlannerPlan | null = null;
    let modelResponseJson: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        modelResponseJson = JSON.parse(text);
        plan = normalizeModelPlan(modelResponseJson, focusCity, normalizedPreferences);
      } catch (err) {
        console.warn('Lodging planner Gemini failure, falling back', err);
      }
    }

    if (!plan) {
      plan = buildFallbackPlan(focusCity, normalizedPreferences, zoneReport, profileRow, body.selection);
    }

    const summaryMarkdown = buildSummaryMarkdown(plan);

    try {
      await supabase.from('lodging_plans').insert({
        user_id: user.id,
        trip_id: null,
        city: focusCity,
        preferences: normalizedPreferences,
        zoning: plan,
        summary_md: summaryMarkdown,
        prompt_payload: {
          prompt,
          selection: body.selection,
          docs: zoneReport.docs.map((doc) => doc.fileName),
        },
        model_response: modelResponseJson,
      });
    } catch (err) {
      console.error('Failed to persist lodging plan', err);
    }

    return NextResponse.json({ plan: { ...plan, summaryMarkdown } });
  } catch (err: any) {
    console.error('Lodging planner error', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate lodging plan' },
      { status: 500 }
    );
  }
}

function resolveFocusCity(selection: StoredSelection): string | null {
  return (
    selection.option.trip?.cityOrder?.[0] ||
    selection.option.cities?.[0]?.cityName ||
    selection.tripInput?.citiesVisiting?.[0] ||
    null
  );
}

function normalizePreferences(
  prefs: LodgingPlannerPreferences | undefined,
  selection: StoredSelection
): LodgingPlannerPreferences {
  const nightsFromSelection = deriveNights(selection);
  const baseWeights = DEFAULT_PREFERENCES.weights;
  const safePrefs = prefs || DEFAULT_PREFERENCES;
  return {
    nightlyBudget: Number.isFinite(safePrefs.nightlyBudget) ? safePrefs.nightlyBudget : DEFAULT_PREFERENCES.nightlyBudget,
    nights: Math.max(1, nightsFromSelection || safePrefs.nights || DEFAULT_PREFERENCES.nights),
    carRental: Boolean(safePrefs.carRental),
    multipleMatches: Boolean(safePrefs.multipleMatches),
    travelingWithFamily: Boolean(safePrefs.travelingWithFamily),
    weights: {
      stadiumProximity: clampNumber(safePrefs.weights?.stadiumProximity ?? baseWeights.stadiumProximity, 0, 100),
      localCulture: clampNumber(safePrefs.weights?.localCulture ?? baseWeights.localCulture, 0, 100),
      walkability: clampNumber(safePrefs.weights?.walkability ?? baseWeights.walkability, 0, 100),
      nightlife: clampNumber(safePrefs.weights?.nightlife ?? baseWeights.nightlife, 0, 100),
      budgetSensitivity: clampNumber(safePrefs.weights?.budgetSensitivity ?? baseWeights.budgetSensitivity, 0, 100),
    },
    carpoolInterest: safePrefs.carpoolInterest,
    notes: safePrefs.notes,
    language: safePrefs.language || 'en',
  };
}

function deriveNights(selection: StoredSelection): number | null {
  const start = selection.tripInput?.startDate ? new Date(selection.tripInput.startDate) : null;
  const end = selection.tripInput?.endDate ? new Date(selection.tripInput.endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return null;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function buildPrompt(params: {
  city: string;
  selection: StoredSelection;
  preferences: LodgingPlannerPreferences;
  profile?: UserProfile | null;
  zoneReport: Awaited<ReturnType<typeof loadZoneReports>>;
  cityContextPrompt: string;
}): string {
  const { city, selection, preferences, profile, zoneReport, cityContextPrompt } = params;
  const travelerSummary = buildTravelerSummary(selection, profile, preferences);
  const zonePrompt = formatZoneReportForPrompt(zoneReport);

  const weightsLine = `Weights ➜ Stadium proximity ${preferences.weights.stadiumProximity}/100, Local culture ${preferences.weights.localCulture}/100, Walkability ${preferences.weights.walkability}/100, Nightlife ${preferences.weights.nightlife}/100, Budget sensitivity ${preferences.weights.budgetSensitivity}/100.`;

  const dates = selection.tripInput?.startDate && selection.tripInput?.endDate
    ? `${selection.tripInput.startDate} → ${selection.tripInput.endDate}`
    : 'Dates TBD';

  return `You are the Lodging Planner for FIFA World Cup 2026. Design a zoning-based lodging plan for ${city}.

TRIP BUILDER CONTEXT:
- Selected itinerary title: ${selection.option.title}
- Summary: ${selection.option.summary}
- City order: ${(selection.option.trip?.cityOrder || selection.option.cities.map((c) => c.cityName)).join(' → ')}
- Trip dates: ${dates}

Traveler profile & preferences:
${travelerSummary}
- Nightly budget target: ~$${preferences.nightlyBudget} USD
- Nights to cover: ${preferences.nights}
- Car rental planned: ${preferences.carRental ? 'Yes' : 'No (assume rideshare, bus, rail)'}
- Multiple match days expected: ${preferences.multipleMatches ? 'Yes' : 'No/Unsure'}
- Traveling with family: ${preferences.travelingWithFamily ? 'Yes' : 'No'}
${preferences.notes ? `- Traveler note: ${preferences.notes}` : ''}
${weightsLine}

${zonePrompt}
${cityContextPrompt}

Respond in strict JSON (no prose) with:
{
  "generatedAt": "ISO timestamp",
  "city": "${city}",
  "stayDates": "${dates}",
  "nights": ${preferences.nights},
  "nightlyBudget": ${preferences.nightlyBudget},
  "travelerSummary": "1 sentence capturing the traveler vibe",
  "topRecommendation": {
    "zoneName": "string",
    "matchScore": 0-100,
    "priceRange": "e.g., $120-$190",
    "estimatedTotal": "5 nights ≈ $950",
    "nightlyRate": "per-night guidance",
    "affordabilityLabel": "Budget/Balanced/Premium",
    "stadiumCommute": "time + transport",
    "fanFestCommute": "time",
    "badge": "short label",
    "reasons": ["bullet", "bullet"]
  },
  "zoneComparisons": [
    {
      "zoneName": "string",
      "matchScore": 0-100,
      "priceRange": "string",
      "nightlyEstimate": "string",
      "stadiumCommute": "string",
      "fanFestCommute": "string",
      "vibe": "string",
      "pros": ["+"],
      "cons": ["-"]
    }
  ],
  "mapMarkers": [
    {
      "name": "zone label",
      "lat": number,
      "lng": number,
      "matchScore": number,
      "priceRange": "string",
      "travelTimeToStadium": "string",
      "travelTimeToFanFest": "string",
      "highlight": boolean
    }
  ],
  "insights": ["transport alert", "cultural insight"],
  "bookingGuidance": ["when/how to book", "OTA tips"],
  "warnings": ["optional caution"]
}

Rules:
- Prioritize research facts (Zapopan gap, fan festival downtown).
- Keep matchScore between 50-100.
- Map markers must include lat/lng.
- Make recommendations actionable for the traveler persona.
- Never mention internal tooling or Gemini.
`;
}

function buildTravelerSummary(
  selection: StoredSelection,
  profile: UserProfile | null | undefined,
  prefs: LodgingPlannerPreferences
): string {
  const lines: string[] = [];
  const groupSize = selection.tripInput?.groupSize || profile?.group_size;
  if (groupSize) {
    lines.push(`- Group size: ${groupSize} travelers${prefs.travelingWithFamily ? ' including family' : ''}.`);
  }
  if ((profile?.children ?? 0) > 0 || (profile?.children_0_5 ?? 0) > 0 || (profile?.children_6_18 ?? 0) > 0 || prefs.travelingWithFamily) {
    lines.push('- Family-friendly lodging, quiet hours, and adjoining rooms appreciated.');
  }
  if (profile?.budget_level) {
    lines.push(`- Baseline budget level: ${profile.budget_level}.`);
  }
  if (profile?.preferred_transport) {
    lines.push(`- Prefers ${profile.preferred_transport} transit when practical.`);
  }
  if (profile?.has_tickets) {
    const matchCity = profile.ticket_match?.city || selection.tripInput?.citiesVisiting?.[0] || 'host city';
    const matchDate = profile.ticket_match?.date || selection.tripInput?.startDate || 'TBD';
    lines.push(`- Has World Cup tickets (${matchCity}, ${matchDate}).`);
  }
  if (prefs.carRental) {
    lines.push('- Comfortable driving or renting a car between venues.');
  }
  return lines.length ? lines.join('\n') : '- Traveler profile lean: general fan traveler.';
}

function formatZoneReportForPrompt(report: Awaited<ReturnType<typeof loadZoneReports>>): string {
  if (!report.zones.length) {
    return 'No structured lodging research was found. Use city context + Trip Builder data to extrapolate zones.';
  }
  let buffer = 'Research-backed lodging zones:\n';
  for (const zone of report.zones) {
    buffer += `ZONE: ${zone.name}${zone.descriptor ? ` (${zone.descriptor})` : ''}\n`;
    if (zone.summary) buffer += `Summary: ${zone.summary}\n`;
    if (zone.geographicArea) buffer += `Area: ${zone.geographicArea}\n`;
    if (zone.targetProfiles?.length) buffer += `Target visitors: ${zone.targetProfiles.join('; ')}\n`;
    if (zone.advantages?.length) buffer += `Pros: ${zone.advantages.join(' | ')}\n`;
    if (zone.disadvantages?.length) buffer += `Cons: ${zone.disadvantages.join(' | ')}\n`;
    if (zone.ratings && Object.keys(zone.ratings).length) {
      buffer += `Ratings: ${Object.entries(zone.ratings)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')}\n`;
    }
    buffer += '\n';
  }
  if (report.summary.length) {
    buffer += `Executive summary notes: ${report.summary.join(' ')}\n`;
  }
  if (report.painPoints.length) {
    buffer += `Pain points & alerts: ${report.painPoints.join(' | ')}\n`;
  }
  if (report.comparisonTables.length) {
    buffer += 'Comparison tables:\n';
    buffer += report.comparisonTables.join('\n\n');
    buffer += '\n';
  }
  return buffer;
}

function normalizeModelPlan(raw: any, fallbackCity: string, prefs: LodgingPlannerPreferences): LodgingPlannerPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!raw.topRecommendation || !raw.zoneComparisons) return null;

  const sanitizeScore = (value: any) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return clampNumber(num, 0, 100);
  };

  const top = raw.topRecommendation || {};
  const topRecommendation = {
    zoneName: String(top.zoneName || top.name || 'Top Zone'),
    matchScore: sanitizeScore(top.matchScore ?? 85),
    priceRange: String(top.priceRange || top.nightlyRate || '$$'),
    estimatedTotal: String(top.estimatedTotal || `${prefs.nights} nights ≈ ~$${prefs.nightlyBudget * prefs.nights}`),
    nightlyRate: top.nightlyRate ? String(top.nightlyRate) : undefined,
    affordabilityLabel: String(top.affordabilityLabel || 'Balanced'),
    stadiumCommute: String(top.stadiumCommute || '30-40 min taxi'),
    fanFestCommute: top.fanFestCommute ? String(top.fanFestCommute) : undefined,
    badge: top.badge ? String(top.badge) : undefined,
    reasons: Array.isArray(top.reasons) && top.reasons.length ? top.reasons.map(String) : ['Best mix of access and culture.'],
  };

  const zoneComparisons: LodgingZoneComparison[] = Array.isArray(raw.zoneComparisons)
    ? raw.zoneComparisons.map((zone: any, idx: number) => ({
        zoneName: String(zone.zoneName || zone.name || `Zone ${idx + 1}`),
        matchScore: sanitizeScore(zone.matchScore ?? 70 - idx * 5),
        priceRange: String(zone.priceRange || '$$'),
        nightlyEstimate: zone.nightlyEstimate ? String(zone.nightlyEstimate) : undefined,
        stadiumCommute: String(zone.stadiumCommute || '30-40 min taxi'),
        fanFestCommute: zone.fanFestCommute ? String(zone.fanFestCommute) : undefined,
        vibe: zone.vibe ? String(zone.vibe) : undefined,
        pros: Array.isArray(zone.pros) ? zone.pros.map(String) : [],
      cons: Array.isArray(zone.cons) ? zone.cons.map(String) : [],
    }))
    : [];
  if (!zoneComparisons.length) {
    return null;
  }

  const mapMarkers: LodgingMapMarker[] = Array.isArray(raw.mapMarkers)
    ? raw.mapMarkers
        .map((marker: any) => ({
          name: String(marker.name || marker.zoneName || 'Zone'),
          lat: Number(marker.lat ?? marker.latitude ?? FALLBACK_CITY_COORDS[fallbackCity]?.lat ?? 0),
          lng: Number(marker.lng ?? marker.longitude ?? FALLBACK_CITY_COORDS[fallbackCity]?.lng ?? 0),
          matchScore: sanitizeScore(marker.matchScore ?? 70),
          priceRange: marker.priceRange ? String(marker.priceRange) : undefined,
          travelTimeToStadium: marker.travelTimeToStadium ? String(marker.travelTimeToStadium) : undefined,
          travelTimeToFanFest: marker.travelTimeToFanFest ? String(marker.travelTimeToFanFest) : undefined,
          highlight: Boolean(marker.highlight),
        }))
        .filter((marker: LodgingMapMarker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng))
    : [];

  return {
    generatedAt: raw.generatedAt || new Date().toISOString(),
    city: String(raw.city || fallbackCity),
    travelerSummary: raw.travelerSummary ? String(raw.travelerSummary) : undefined,
    stayDates: raw.stayDates ? String(raw.stayDates) : undefined,
    nights: Number.isFinite(raw.nights) ? Number(raw.nights) : prefs.nights,
    nightlyBudget: Number.isFinite(raw.nightlyBudget) ? Number(raw.nightlyBudget) : prefs.nightlyBudget,
    topRecommendation,
    zoneComparisons,
    mapMarkers,
    insights: Array.isArray(raw.insights) ? raw.insights.map(String) : [],
    bookingGuidance: Array.isArray(raw.bookingGuidance) ? raw.bookingGuidance.map(String) : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings.map(String) : undefined,
    summaryMarkdown: raw.summaryMarkdown ? String(raw.summaryMarkdown) : undefined,
  };
}

function buildFallbackPlan(
  city: string,
  prefs: LodgingPlannerPreferences,
  report: Awaited<ReturnType<typeof loadZoneReports>>,
  profile: UserProfile | null | undefined,
  selection?: StoredSelection
): LodgingPlannerPlan {
  const zones = report.zones.length ? report.zones : createSyntheticZones(city);
  const comparisons = zones.slice(0, 3).map((zone, idx) => zoneToComparison(zone, idx));
  const topComparison = comparisons[0];
  const referenceZone = zones.find((z) => z.name === topComparison.zoneName) || zones[0];

  const topRecommendation = {
    zoneName: topComparison.zoneName,
    matchScore: topComparison.matchScore,
    priceRange: topComparison.priceRange,
    estimatedTotal: `${prefs.nights} nights ≈ ${formatCurrencyRange(prefs.nightlyBudget * prefs.nights)}`,
    nightlyRate: topComparison.nightlyEstimate,
    affordabilityLabel: prefs.nightlyBudget <= 180 ? 'Budget' : prefs.nightlyBudget <= 275 ? 'Balanced' : 'Premium',
    stadiumCommute: topComparison.stadiumCommute,
    fanFestCommute: topComparison.fanFestCommute,
    badge: 'Research-backed',
    reasons: [
      referenceZone?.summary || `${zoneDescriptor(referenceZone)} with easy Fan Fest walks`,
      'Balanced price vs. stadium commute per Zapopan research',
    ],
  };

  const mapMarkers = buildMapMarkers(city, comparisons, topRecommendation.zoneName);
  const insights = report.painPoints.length
    ? report.painPoints.slice(0, 3)
    : [`Watch the stadium commute gap — expect 30-40 min taxi rides from downtown ${city}.`];
  const bookingGuidance = [
    'Lock refundable rates 6+ months out; Guadalajara hotels are already spiking around Mexico group matches.',
    prefs.carRental
      ? 'If renting a car, target properties with parking (Zona Minerva, Zapopan) to avoid match-day surcharges.'
      : 'Budget for Uber/Didi rides (~$10 each way) or look for official shuttles departing Plaza Liberación.',
  ];

  return {
    generatedAt: new Date().toISOString(),
    city,
    travelerSummary: profile?.budget_level
      ? `Travel party leans ${profile.budget_level} with ${prefs.nights} nights in ${city}.`
      : `Planning ${prefs.nights} nights in ${city} with ~$${prefs.nightlyBudget}/night budget.`,
    stayDates: selectionDatesSummary(prefs, profile, selection),
    nights: prefs.nights,
    nightlyBudget: prefs.nightlyBudget,
    topRecommendation,
    zoneComparisons: comparisons,
    mapMarkers,
    insights,
    bookingGuidance,
    warnings: report.painPoints.length ? report.painPoints.slice(0, 1) : undefined,
  };
}

function createSyntheticZones(city: string): LodgingZone[] {
  return [
    {
      id: 'central',
      name: `${city} Center`,
      descriptor: 'Fan festival core',
      summary: 'Walkable historic core with best nightlife + culture.',
      advantages: ['Fan Fest access', 'Most hotels', 'Transit hubs'],
      disadvantages: ['Taxi to stadium', 'Nighttime noise'],
      ratings: {
        'Distance to Stadium': '30-40 min taxi',
        'Fan Festival Access': 'Walkable',
        'Price Range': '$$'
      },
      priceRange: '$$'
    },
    {
      id: 'balanced',
      name: `${city} Midtown`,
      descriptor: 'Best balance',
      summary: 'Upscale corridor between stadium + fan fest.',
      advantages: ['Safest vibe', 'International hotels'],
      disadvantages: ['Higher rates'],
      ratings: {
        'Distance to Stadium': '20-30 min drive',
        'Fan Festival Access': '15 min ride',
        'Price Range': '$$-$$$'
      },
      priceRange: '$$-$$$'
    },
    {
      id: 'stadium',
      name: `${city} Stadium District`,
      descriptor: 'Match-day hub',
      summary: 'Closest lodging to the stadium with limited nightlife.',
      advantages: ['Walk/short taxi on match day'],
      disadvantages: ['Few hotels', 'Need rides to Fan Fest'],
      ratings: {
        'Distance to Stadium': '0-10 min',
        'Fan Festival Access': '35-45 min taxi',
        'Price Range': '$$'
      },
      priceRange: '$$'
    },
  ];
}

function zoneToComparison(zone: LodgingZone, idx: number): LodgingZoneComparison {
  return {
    zoneName: zone.name,
    matchScore: clampNumber(90 - idx * 7, 60, 95),
    priceRange: zone.priceRange || zone.ratings?.['Price Range'] || '$$',
    nightlyEstimate: zone.priceRange,
    stadiumCommute: zone.ratings?.['Distance to Stadium'] || '30-40 min taxi/rideshare',
    fanFestCommute: zone.ratings?.['Fan Festival Access'],
    vibe: zone.descriptor,
    pros: zone.advantages?.slice(0, 3) || [],
    cons: zone.disadvantages?.slice(0, 2) || [],
  };
}

function buildMapMarkers(city: string, comparisons: LodgingZoneComparison[], topZone?: string): LodgingMapMarker[] {
  const cityCoords = FALLBACK_CITY_COORDS[city];
  const zoneCoords = FALLBACK_ZONE_COORDS[city] || {};
  return comparisons.map((zone) => {
    const coords = zoneCoords[zone.zoneName] || cityCoords;
    return {
      name: zone.zoneName,
      lat: coords?.lat ?? cityCoords?.lat ?? 0,
      lng: coords?.lng ?? cityCoords?.lng ?? 0,
      matchScore: zone.matchScore,
      priceRange: zone.priceRange,
      travelTimeToStadium: zone.stadiumCommute,
      travelTimeToFanFest: zone.fanFestCommute,
      highlight: zone.zoneName === topZone,
    };
  });
}

function selectionDatesSummary(
  prefs: LodgingPlannerPreferences,
  profile: UserProfile | null | undefined,
  selection?: StoredSelection
) {
  if (selection?.tripInput?.startDate && selection.tripInput?.endDate) {
    return `${selection.tripInput.startDate} → ${selection.tripInput.endDate} (goal: ${prefs.nights} nights)`;
  }
  if (profile?.ticket_match?.date) {
    return `${profile.ticket_match.date} focus — plan ${prefs.nights} nights around that window.`;
  }
  return `Cover ${prefs.nights} night(s); align with match days + rest days.`;
}

function buildSummaryMarkdown(plan: LodgingPlannerPlan): string {
  const lines = [
    `# ${plan.city} Lodging Blueprint`,
    `*Generated ${new Date(plan.generatedAt).toLocaleString()}*`,
    `\n## Top pick`,
    `- ${plan.topRecommendation.zoneName} (${plan.topRecommendation.matchScore}% match)`,
    `- ${plan.topRecommendation.priceRange} · ${plan.topRecommendation.stadiumCommute}`,
    `\n## Booking guidance`,
    ...plan.bookingGuidance.map((item) => `- ${item}`),
    `\n## Insights`,
    ...plan.insights.map((item) => `- ${item}`),
  ];
  if (plan.warnings?.length) {
    lines.push('\n## Watch-outs');
    plan.warnings.forEach((w) => lines.push(`- ${w}`));
  }
  return lines.join('\n');
}

function formatCurrencyRange(value: number): string {
  if (!Number.isFinite(value)) return '$$';
  return `$${Math.round(value / 50) * 50}`;
}

function zoneDescriptor(zone?: LodgingZone) {
  return zone?.descriptor || zone?.name || 'zone';
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function cleanJSON(text: string) {
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\n?/gi, '').replace(/```/g, '');
  }
  return jsonText;
}
