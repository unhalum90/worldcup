import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accept either the common name or alternate name the env may have.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Supabase credentials are not set in environment.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '');

const MAILERLITE_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_WEBSITE_GROUP_ID = process.env.MAILERLITE_WEBSITE_GROUP_ID;
const MAILERLITE_NEWSLETTER_GROUP_ID = process.env.MAILERLITE_NEWSLETTER_GROUP_ID;

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

    // Optionally: call MailerLite API here to add to group
    const mailerliteResults: Record<string, { status: number; body?: string } | null> = {
      website: null,
      newsletter: null,
    };

    if (MAILERLITE_KEY) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MAILERLITE_KEY}`,
          // MailerLite sometimes accepts the legacy header name; include it for compatibility
          'X-MailerLite-ApiKey': MAILERLITE_KEY,
        };

        // Add to website group if configured
        if (MAILERLITE_WEBSITE_GROUP_ID) {
          try {
            const res = await fetch(
              `https://api.mailerlite.com/api/v2/groups/${MAILERLITE_WEBSITE_GROUP_ID}/subscribers`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
              }
            );
            const text = await res.text().catch(() => '');
            if (!res.ok) {
              console.error('MailerLite website group add failed', res.status, text);
            }
            mailerliteResults.website = { status: res.status, body: text };
          } catch (mlErr) {
            console.error('MailerLite website group add failed', mlErr);
            mailerliteResults.website = { status: 0, body: String(mlErr) };
          }
        }

        // Add to newsletter group if configured
        if (MAILERLITE_NEWSLETTER_GROUP_ID) {
          try {
            const res = await fetch(
              `https://api.mailerlite.com/api/v2/groups/${MAILERLITE_NEWSLETTER_GROUP_ID}/subscribers`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
              }
            );
            const text = await res.text().catch(() => '');
            if (!res.ok) {
              console.error('MailerLite newsletter group add failed', res.status, text);
            }
            mailerliteResults.newsletter = { status: res.status, body: text };
          } catch (mlErr) {
            console.error('MailerLite newsletter group add failed', mlErr);
            mailerliteResults.newsletter = { status: 0, body: String(mlErr) };
          }
        }
      } catch (err) {
        console.error('Error while calling MailerLite', err);
      }
    }

    return NextResponse.json({ ok: true, id: data.id, mailerlite: mailerliteResults });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
