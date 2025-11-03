import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { syncMailingList } from '@/lib/mailerlite/server';

function asArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') return [value];
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, interest = 'general', source = 'hero', tags = [] } = body ?? {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const interestTag = typeof interest === 'string' && interest.trim().length > 0 ? `interest:${interest.trim()}` : null;
    const tagList = new Set<string>(asArray(tags));
    if (interestTag) tagList.add(interestTag);
    tagList.add('cta_signup');

    const metadata = {
      interest,
      source,
      captured_at: new Date().toISOString(),
    };

    const result = await syncMailingList({
      email,
      source,
      tags: Array.from(tagList),
      metadata,
      fields: {
        source,
        interest,
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'mailing_list_sync_failed' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      mailerliteId: result.mailerliteId ?? null,
    });
  } catch (err) {
    console.error('[Subscribe] Unexpected error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
