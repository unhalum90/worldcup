import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function normalizeToHttps(u: string): string {
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:'
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return u.replace(/^http:\/\//i, 'https://')
  }
}

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const buyUrl = process.env.LS_MEMBER_BUY_URL || process.env.NEXT_PUBLIC_LS_MEMBER_BUY_URL

  if (!buyUrl) {
    return NextResponse.json({ error: 'missing_buy_url' }, { status: 500 })
  }

  const res = NextResponse.redirect('about:blank')
  const supabase = createServerClient(
    normalizeToHttps(supabaseUrl),
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try { res.cookies.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: any) {
          try { res.cookies.delete({ name, ...options }) } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  // If not logged in, send to memberships page
  if (!user) {
    const url = new URL('/memberships', req.url)
    url.searchParams.set('from', 'member-checkout')
    return NextResponse.redirect(url)
  }

  const email = user.email || ''
  const url = new URL(buyUrl)

  // Best-effort email prefill and lock across known patterns
  const params = url.searchParams
  params.set('email', email)
  params.set('checkout[email]', email)
  params.set('checkout[email_locked]', 'true')
  // Pass custom data so webhook can map by user_id even if email differs
  params.set('checkout[custom][user_id]', user.id)
  params.set('checkout[custom][source]', 'wc26_app')

  // Preserve known passthrough query params (e.g., ?code=XXXX for discounts)
  const incoming = new URL(req.url)
  const discount = incoming.searchParams.get('code') || incoming.searchParams.get('discount')
  if (discount) {
    // Try multiple common keys to maximize compatibility
    params.set('discount', discount)
    params.set('checkout[discount_code]', discount)
  }

  // Inspect mode for debugging: returns JSON instead of redirect
  if (incoming.searchParams.get('inspect') === '1') {
    return NextResponse.json({
      ok: true,
      resolvedBuyUrl: buyUrl,
      finalRedirect: url.toString(),
      userEmail: email,
      userId: user.id,
      env: {
        hasLSMemberBuyUrl: typeof process.env.LS_MEMBER_BUY_URL === 'string' && process.env.LS_MEMBER_BUY_URL.length > 0,
        hasNextPublicMemberBuyUrl: typeof process.env.NEXT_PUBLIC_LS_MEMBER_BUY_URL === 'string' && process.env.NEXT_PUBLIC_LS_MEMBER_BUY_URL.length > 0,
      }
    })
  }

  return NextResponse.redirect(url.toString())
}
