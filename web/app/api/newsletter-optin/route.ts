import { NextRequest, NextResponse } from 'next/server';
import { syncMailingList } from '@/lib/mailerlite/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'onboarding_modal' } = body ?? {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await syncMailingList({
      email,
      source,
      tags: ['modal_opt_in'],
      metadata: {
        project: 'World Cup 26 Fan Zone',
        opt_in: true,
        captured_at: new Date().toISOString(),
        source,
      },
      fields: {
        source,
        opt_in: true,
      },
      pushToMailerLite: false,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? 'mailing_list_sync_failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter Opt-In] error', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter opt-in' },
      { status: 500 },
    );
  }
}
