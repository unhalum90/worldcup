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
  const buyUrl = process.env.LS_BUNDLE4_BUY_URL || process.env.NEXT_PUBLIC_LS_BUNDLE4_BUY_URL

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
  // If not logged in, still let them buy, but prefer to capture email when we can
  const url = new URL(buyUrl)
  const params = url.searchParams

  if (user?.email) {
    const email = user.email
    params.set('email', email)
    params.set('checkout[email]', email)
    params.set('checkout[email_locked]', 'true')
    params.set('checkout[custom][user_id]', user.id)
    params.set('checkout[custom][source]', 'wc26_app')
  }

  const incoming = new URL(req.url)
  const discount = incoming.searchParams.get('code') || incoming.searchParams.get('discount')
  if (discount) {
    params.set('discount', discount)
    params.set('checkout[discount_code]', discount)
  }

  if (incoming.searchParams.get('inspect') === '1') {
    return NextResponse.json({
      ok: true,
      resolvedBuyUrl: buyUrl,
      finalRedirect: url.toString(),
      userEmail: user?.email || null,
      userId: user?.id || null,
      env: {
        hasLSBundleBuyUrl: typeof process.env.LS_BUNDLE4_BUY_URL === 'string' && process.env.LS_BUNDLE4_BUY_URL.length > 0,
        hasNextPublicBundleBuyUrl: typeof process.env.NEXT_PUBLIC_LS_BUNDLE4_BUY_URL === 'string' && process.env.NEXT_PUBLIC_LS_BUNDLE4_BUY_URL.length > 0,
      }
    })
  }

  return NextResponse.redirect(url.toString())
}
