import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const { topic, city, referenceUrl } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build prompt
    const cityContext = city ? ` in ${city}` : ' for World Cup 2026 visitors';
    const referenceContext = referenceUrl 
      ? `\n\nReference article style (URL provided but not fetched in this demo): ${referenceUrl}`
      : '';

    const outlinePrompt = `You are an expert travel and sports content writer specializing in FIFA World Cup 2026 coverage.

Create a comprehensive article outline for: "${topic}"${cityContext}

CRITICAL CONTEXT - World Cup 2026 Geographic Complexities:
Many host cities present unique lodging challenges that casual fans overlook:
   - Stadiums like Dallas, Miami, Kansas City are in suburbs/industrial areas
   - No metro lines = you're stuck without a car
   - Fan Festivals are often downtown, miles away from stadiums
   - Limited restaurants/nightlife near suburban stadiums
   - Hotel rates surge 300-500% near stadiums

2. PRESENT STRATEGIC ALTERNATIVES: Don't just list hotels - explain the TRADEOFFS:
   - "Stay downtown near Fan Festival vs. near stadium" - which makes sense when?
   - "Rent a car vs. rely on Uber" - costs, convenience, parking realities
   - "Transit-accessible neighborhoods" - be specific about routes, times, costs
   - "Alternative cities" - for multi-match attendees, staying in nearby cities can save thousands
   - Each option should have a CREATIVE TITLE like "The Counter-Intuitive Choice" or "The Smart Value Play"

3. SHOW LOCAL EXPERTISE: Include insider details that prove you know the city:
   - Specific neighborhoods with character descriptions
   - Transit line names, costs, and frequency
   - Traffic patterns on game days
   - Airport proximity and preferences (e.g., "Hobby vs. IAH")
   - Where locals actually go vs. tourist traps
   - Specific hotel/area names as examples
   - Use local terminology and references

4. STRUCTURE EACH LODGING OPTION:
   - Creative section title (e.g., "The Savvy Traveler's Secret: Stay on the METRORail Red Line")
   - WHY this strategy works (opening paragraph)
   - Insider hack or tip (specific, actionable)
   - Specific neighborhoods/areas with bullet points:
     * Neighborhood name + vibe description
     * Commute to Stadium: [specific time/method]
     * Why stay here: [specific advantages]
   - Closing thought on who this is best for

Requirements:
- Use Markdown formatting (headings, lists, bold, italics)
- 1200-1800 words minimum
- Confident, problem-solving tone - you're the expert cutting through the confusion
- Include specific data: distances, transit times, costs, neighborhood names
- Use comparison tables where helpful (transit options, neighborhood pros/cons)
- Incorporate SEO keywords naturally: "${topic}"${cityContext}
- Strong hook that challenges conventional wisdom (e.g., "hotel rates surge 400%")
- Use H2 (##) for main lodging strategies, H3 (###) for subsections if needed
- Add horizontal rules (---) between major sections for visual separation
- DO NOT write a conclusion section - it will be added automatically

Your content MUST address these complexities and present strategic alternatives.

Requirements:
- Target audience: Soccer fans planning trips to World Cup 2026 who need strategic lodging advice
- SEO-focused with informational and practical value
- Emphasize the geographic/transit realities that make lodging choices complex
- Include introduction, 3-5 main sections with strategic lodging options, and practical comparisons
- Address stadium location, Fan Festival location, transit options (or lack thereof)
- Provide specific neighborhood recommendations with pros/cons
- Include insider tips that show deep local knowledge${referenceContext}

Return the outline in a clear, structured format.`;

    // Step 1: Generate outline
    const outlineCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert travel writer creating SEO-optimized content for World Cup 2026.',
        },
        {
          role: 'user',
          content: outlinePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const outline = outlineCompletion.choices[0]?.message?.content?.trim() || '';

    // Step 2: Generate title
    const titlePrompt = `Based on this outline, create a compelling, SEO-friendly blog post title (60-70 characters max):

${outline}

Topic: ${topic}${cityContext}

Return ONLY the title, no quotes or additional text.`;

    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert creating compelling blog titles.',
        },
        {
          role: 'user',
          content: titlePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const title = titleCompletion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || '';

    // Step 3: Generate full article in Markdown
    const contentPrompt = `Write a complete, in-depth blog post based on this outline:

${outline}

REFERENCE EXAMPLE - Match This Quality & Detail Level:
Here's an example of the tone, depth, and strategic thinking we expect:

"For World Cup travel in Houston, direct access to the METRORail Red Line is strategically more valuable than walking distance to the stadium. Fan experiences confirm that the train is the most recommended way to get to NRG Park, allowing you to bypass what locals describe as 'horrendous' traffic and congested, expensive parking. At just $1.25 for a one-way trip, it's an unbeatable value.

Here's the ultimate insider tip for leaving the match: to avoid the packed northbound trains, take the southbound train one stop to the Fannin South Park & Ride. Then, simply cross the platform and board the now-empty northbound train for a comfortable ride back to your neighborhood."

Notice:
- Specific transit line name (METRORail Red Line)
- Exact cost ($1.25)
- Real fan feedback ("horrendous" traffic)
- Insider hack that shows deep local knowledge (southbound trick)
- Confident, problem-solving tone

CRITICAL TONE & MESSAGING:
This is NOT generic travel advice. Your key differentiator is addressing the COMPLEXITY of World Cup lodging decisions:

1. CALL OUT THE PROBLEM: Most fans assume "book near stadium" is smart, but:
   - Stadiums like Dallas, Miami, Kansas City are in suburbs/industrial areas
   - No metro lines = you're stuck without a car
   - Fan Festivals are often downtown, miles away from stadiums
   - Limited restaurants/nightlife near suburban stadiums

2. PRESENT STRATEGIC ALTERNATIVES: Don't just list hotels - explain the TRADEOFFS:
   - "Stay downtown near Fan Festival vs. near stadium" - which makes sense when?
   - "Rent a car vs. rely on Uber" - costs, convenience, parking realities
   - "Transit-accessible neighborhoods" - be specific about routes, times, costs
   - "Alternative cities" - for multi-match attendees, staying in nearby cities can save thousands

3. SHOW LOCAL EXPERTISE: Include insider details that prove you know the city:
   - Specific neighborhoods with character descriptions
   - Transit line names, costs, and frequency
   - Traffic patterns on game days
   - Where locals actually go vs. tourist traps

Requirements:
- Use Markdown formatting (headings, lists, bold, italics)
- 1200-1800 words
- Confident, problem-solving tone - you're the expert cutting through the confusion
- Include specific data: distances, transit times, neighborhood names
- Use comparison tables where helpful (transit options, neighborhood pros/cons)
- Incorporate SEO keywords naturally: "${topic}"${cityContext}
- Strong hook that challenges conventional wisdom
- Use H2 (##) for main sections, H3 (###) for subsections
- DO NOT write a conclusion section - it will be added automatically

Write the full article now in Markdown:`;

    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert travel writer creating detailed, SEO-optimized blog posts in Markdown format.',
        },
        {
          role: 'user',
          content: contentPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedContent = contentCompletion.choices[0]?.message?.content?.trim() || '';

    // Add automatic Call-to-Action footer
    const ctaFooter = `

---

## Plan Your Perfect World Cup 2026 Experience

Ready to make the most of your World Cup adventure? Our comprehensive city guides cover everything you need to know about all 16 host cities across the USA, Canada, and Mexico.

**Explore our resources:**
- 📍 **[City Guides](/cityguides)** - Detailed guides for every World Cup 2026 host city
- 🗺️ **[Interactive Maps](/cities)** - Navigate stadiums, hotels, restaurants, and attractions
- 🎫 **[Match Schedule](/venues)** - Plan your itinerary around key games
- 💡 **[Travel Tips](/blog)** - Expert advice from fellow soccer fans

**Join our community** of World Cup enthusiasts and get exclusive tips, updates, and local insights delivered straight to your inbox. Sign up for our newsletter today!

*WorldCup FanZone - Your trusted companion for FIFA World Cup 2026.*`;

    const content = generatedContent + ctaFooter;

    return NextResponse.json({
      title,
      outline,
      content,
      topic,
      city: city || null,
    });

  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
