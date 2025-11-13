import { NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const PROFANITY = [
  'fuck','shit','bitch','asshole','cunt','bastard','dick','piss','slut','whore'
] // lightweight; expand later

function isProfane(text: string) {
  const t = text.toLowerCase()
  return PROFANITY.some((w) => t.includes(w))
}

async function getClientIp(): Promise<string | null> {
  const h = await headers()
  const xff = h.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || null
  const real = h.get('x-real-ip')
  return real || null
}

export async function POST(req: Request) {
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    return new Response('Not Found', { status: 404 })
  }
  try {
    const body = await req.json()
    const { matchSlug, text, cityId, displayName } = body as {
      matchSlug?: string
      text?: string
      cityId?: string | null
      displayName?: string | null
    }
    if (!matchSlug || !text) {
      return NextResponse.json({ error: 'Missing matchSlug or text' }, { status: 400 })
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
    }
    if (isProfane(text)) {
      return NextResponse.json({ error: 'Contains disallowed language' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: match, error: mErr } = await supabase
      .from('tournament_matches')
      .select('id')
      .eq('slug', matchSlug)
      .maybeSingle()
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    const ip = await getClientIp()
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

    // Simple rate limit: one comment per 20s per cookie or IP
    const cutoff = new Date(Date.now() - 20 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('tournament_comments')
      .select('id, created_at')
      .eq('match_id', match.id)
      .or(
        [
          cookieId ? `cookie_id.eq.${cookieId}` : undefined,
          ip ? `ip_address.eq.${ip}` : undefined,
        ]
          .filter(Boolean)
          .join(',') || 'id.eq.00000000-0000-0000-0000-000000000000'
      )
      .order('created_at', { ascending: false })
      .limit(1)

    if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at).toISOString()
      if (last > cutoff) {
        return NextResponse.json({ error: 'You are commenting too quickly' }, { status: 429 })
      }
    }

    const { data: inserted, error } = await supabase
      .from('tournament_comments')
      .insert({
        match_id: match.id,
        city_id: cityId || null,
        user_id: user?.id ?? null,
        ip_address: ip,
        cookie_id: cookieId,
        display_name: displayName || null,
        comment_text: text,
      })
      .select('id, comment_text, created_at, display_name, city_id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(inserted)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
