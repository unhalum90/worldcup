import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // requires service role key for inserts from server

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Supabase credentials are not set in environment.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, interest = 'general', source = 'hero', tags = [] } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Insert to mailing_list table
    const { data, error } = await supabase
      .from('mailing_list')
      .insert([
        {
          email: email.toLowerCase().trim(),
          source,
          tags,
          metadata: { interest },
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally: call MailerLite API here to add to group -- keep separate to avoid embedding keys

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
