import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
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

Requirements:
- Target audience: Soccer fans planning trips to World Cup 2026
- SEO-focused with informational and practical value
- Include introduction, 3-5 main sections with subsections, and conclusion
- Practical, actionable advice for travelers
- Incorporate World Cup 2026 context where relevant${referenceContext}

Return the outline in a clear, structured format.`;

    // Step 1: Generate outline
    const outlineCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
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
      model: 'gpt-4',
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

Requirements:
- Use Markdown formatting (headings, lists, bold, italics)
- 1200-1800 words
- Engaging, conversational tone while maintaining expertise
- Include practical tips, specific recommendations, and actionable advice
- Incorporate SEO keywords naturally: "${topic}"${cityContext}
- Add a strong introduction and conclusion
- Use H2 (##) for main sections, H3 (###) for subsections
- Include at least one list or table where appropriate

Write the full article now in Markdown:`;

    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
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

    const content = contentCompletion.choices[0]?.message?.content?.trim() || '';

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
