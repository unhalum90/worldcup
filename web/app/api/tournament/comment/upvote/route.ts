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
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    return new Response('Not Found', { status: 404 })
  }
  try {
    const body = await req.json()
    const { commentId } = body as { commentId?: string }
    if (!commentId) return NextResponse.json({ error: 'commentId required' }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
    const { data, error } = await supabase.rpc('cast_tournament_comment_upvote', {
      p_comment_id: commentId,
      p_user_id: user?.id ?? null,
      p_ip_address: ip,
      p_cookie_id: cookieId,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
