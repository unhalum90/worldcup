import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@/lib/supabaseServer';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

interface TravelPlanRequest {
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
    const formData: TravelPlanRequest = await request.json();

    // Fetch city data from database
    const supabase = createServerClient();
    const { data: cities, error } = await supabase
      .from('cities')
      .select('name, stadium_name, stadium_lat, stadium_long, fan_fest_location, fan_fest_lat, fan_fest_long, airport_code, country')
      .in('name', formData.citiesVisiting);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
    }

    // Build the prompt for Gemini
    const prompt = `You are a World Cup 2026 travel expert. Using the following preferences and city information, create 2-3 different personalized trip itinerary options:

**Traveler Details:**
- Origin: ${formData.originCity}${formData.originAirport ? ` (${formData.originAirport.code} - ${formData.originAirport.name})` : ''}
- Group Size: ${formData.groupSize} adults${formData.children > 0 ? `, ${formData.children} children (ages 0-12)` : ''}${formData.seniors > 0 ? `, ${formData.seniors} seniors (65+)` : ''}
- Mobility Considerations: ${formData.mobilityIssues ? 'Yes - group has mobility limitations' : 'No special mobility needs'}
- Transport Mode: ${formData.transportMode}
- Budget Level: ${formData.budgetLevel}
- Travel Dates: ${formData.startDate} to ${formData.endDate}
${formData.personalContext ? `- Special Context: ${formData.personalContext}` : ''}

**Cities & Stadiums:**
${cities?.map(city => `
- ${city.name}, ${city.country}
  - Stadium: ${city.stadium_name} (${city.stadium_lat}, ${city.stadium_long})
  - Fan Festival: ${city.fan_fest_location} (${city.fan_fest_lat}, ${city.fan_fest_long})
  - Airport: ${city.airport_code}
`).join('\n')}

**Instructions:**
1. Provide 2-3 distinct itinerary options (e.g., "Budget-Conscious Option", "Balanced Comfort Option", "Premium Experience Option")
2. For each option include:
   - **Flights:** Recommended routing from origin to cities, including airport codes and estimated costs
   - **Lodging Zones:** Specific neighborhoods/areas to stay in each city with:
     - Why this area makes sense (proximity to stadium/fan fest, transit access, safety, atmosphere)
     - Estimated nightly hotel rates for this budget level
     - Transit times to stadium and fan festival
     - Pros and cons of each area
   - **Match Day Logistics:** How to get from hotel to stadium (DART, MARTA, Uber, etc.)
   - **Insider Tips:** City-specific advice (e.g., "Dallas has excellent light rail but stadium is in Arlington", "Miami requires car/Uber to Hard Rock Stadium", "Atlanta's MARTA connects directly to Mercedes-Benz Stadium")
3. Consider:
   - Group composition (families need different recommendations than young adults)
   - Transport mode (car rental opens up cheaper suburban options, public transit means stay near metro lines)
   - Budget level affects neighborhood choices
   - Mobility issues mean prioritize areas with good accessibility
4. Be specific with neighborhood names, transit lines, and realistic cost estimates
5. Focus on World Cup 2026 context (June-July 2026)

Format the response as JSON in this exact structure:
{
  "options": [
    {
      "title": "Budget-Conscious Fan Experience",
      "summary": "Brief 1-2 sentence overview of this option's philosophy",
      "flights": {
        "routing": "Detailed flight plan with airports and connections",
        "estimatedCost": "$1,200 - $1,500 per person"
      },
      "cities": [
        {
          "cityName": "Dallas",
          "lodgingZones": [
            {
              "zoneName": "Irving",
              "whyStayHere": "Near DFW airport, budget-friendly hotels, DART accessible with transfer",
              "estimatedRate": "$120-$150/night",
              "transitToStadium": "35 min drive or 45 min via DART Orange Line + transfer",
              "transitToFanFest": "40 min drive or 50 min via DART",
              "pros": ["Most affordable option", "Near airport", "Free hotel parking"],
              "cons": ["Farther from action", "Requires transit transfer", "Limited nightlife"]
            }
          ],
          "matchDayLogistics": "Take DART Orange Line from Irving to Victory Station, transfer to Red Line towards Parker Road, get off at AT&T Stadium station. Total: ~45 minutes, $5 round trip.",
          "insiderTips": ["AT&T Stadium is actually in Arlington, not Dallas proper", "Buy DART day pass for unlimited rides", "Downtown Dallas is 40 min away via DART for pre-game festivities"]
        }
      ]
    }
  ]
}

Return ONLY valid JSON with 2-3 complete itinerary options. Be thorough and specific with neighborhood recommendations and transit details.`;

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
        origin_city: formData.originCity,
        group_size: formData.groupSize,
        children: formData.children,
        seniors: formData.seniors,
        mobility_issues: formData.mobilityIssues,
        transport_mode: formData.transportMode,
        budget_level: formData.budgetLevel,
        cities_visiting: formData.citiesVisiting,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        itinerary: itinerary
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
