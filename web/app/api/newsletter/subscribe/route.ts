import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const { email, source } = (await req.json()) as { email?: string; source?: string }
    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Prefer service-role client for inserts so RLS does not block server-side subscriptions
    let supabase
    try {
      supabase = await createServiceClient()
    } catch (err) {
      // Fallback to request-scoped server client (may be RLS-restricted)
      supabase = await createClient()
    }

    const { error } = await supabase.from('mailing_list').insert({ email, source: source || 'tournament_cta', tags: ['tournament'] })
    if (error) {
      // Return detailed message so UI can display useful diagnostics (safe in non-production)
      return NextResponse.json({ ok: false, message: error.message || 'Database insert failed' }, { status: 200 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

