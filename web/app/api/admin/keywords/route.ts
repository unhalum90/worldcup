import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { seedTopic, city } = await request.json();

    if (!seedTopic) {
      return NextResponse.json(
        { error: 'Seed topic is required' },
        { status: 400 }
      );
    }

    // Build prompt
    const cityContext = city ? ` specifically for ${city}` : '';
    const prompt = `You are an SEO keyword research expert for World Cup 2026 content.

Generate 15-20 high-value SEO keywords related to: "${seedTopic}"${cityContext}

Context:
- The 2026 FIFA World Cup will be hosted across North America
- Target audience: Soccer fans, travelers planning trips to World Cup cities
- Focus on informational and transactional search intent
- Include long-tail keywords that fans would search for

Requirements:
- Include variations with "World Cup 2026", "FIFA 2026", and city-specific terms
- Mix of commercial intent (hotels, tickets, restaurants) and informational (guides, tips, attractions)
- Consider questions fans might ask (what, where, how, best, top)
- Avoid overly broad keywords

Return ONLY a JSON array of keyword strings, no additional text or formatting.
Example format: ["keyword 1", "keyword 2", "keyword 3"]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO keyword research assistant. Always return valid JSON arrays.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse keywords from response
    let keywords: string[] = [];
    try {
      keywords = JSON.parse(responseText);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON array from text
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        keywords = JSON.parse(match[0]);
      } else {
        // Fallback: split by newlines and clean up
        keywords = responseText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.startsWith('{') && !line.startsWith('['))
          .map((line: string) => line.replace(/^["\-\d.\s]+/, '').replace(/["]+$/, ''))
          .filter((kw: string) => kw.length > 0);
      }
    }

    return NextResponse.json({
      keywords: keywords.slice(0, 20), // Limit to 20
      seedTopic,
      city: city || null,
    });

  } catch (error: any) {
    console.error('Error generating keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate keywords' },
      { status: 500 }
    );
  }
}
