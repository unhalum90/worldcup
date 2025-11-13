import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email, source } = (await req.json()) as { email?: string; source?: string }
    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('mailing_list').insert({ email, source: source || 'tournament_cta', tags: ['tournament'] })
    if (error) {
      // Even if RLS blocks, respond 200 to keep UX smooth; log server-side only in real deployment
      return NextResponse.json({ ok: false, message: error.message }, { status: 200 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

