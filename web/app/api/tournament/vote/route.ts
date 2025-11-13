import { NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function getClientIp(): Promise<string | null> {
  const h = await headers()
  const xff = h.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || null
  const real = h.get('x-real-ip')
  return real || null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { matchSlug, cityId } = body as { matchSlug?: string; cityId?: string }
    if (!matchSlug || !cityId) {
      return NextResponse.json({ error: 'Missing matchSlug or cityId' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Resolve match by slug
    const { data: match, error: mErr } = await supabase
      .from('tournament_matches')
      .select('id, status, city_a_id, city_b_id')
      .eq('slug', matchSlug)
      .maybeSingle()
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Read or set anonymous voter cookie (fallback if middleware missed)
    const cookieStore = await cookies()
    let cookieId = cookieStore.get('t_voter')?.value
    if (!cookieId) {
      cookieId = crypto.randomUUID()
      try {
        cookieStore.set('t_voter', cookieId, {
          httpOnly: false,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 365 * 5,
        })
      } catch {}
    }

    const ip = await getClientIp()

    const { data, error } = await supabase.rpc('cast_tournament_vote', {
      p_match_id: match.id,
      p_city_id: cityId,
      p_user_id: user?.id ?? null,
      p_ip_address: ip,
      p_cookie_id: cookieId,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    // Mark this matchup as voted in a cookie for UI badges on hub/match pages
    try {
      const store = await cookies()
      store.set(`t_voted_${matchSlug}`, '1', {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    } catch {}

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
