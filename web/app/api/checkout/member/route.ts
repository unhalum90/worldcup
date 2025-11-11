import { NextRequest, NextResponse } from 'next/server'

// Redirect to configured Lemon Squeezy checkout or fallbacks
export async function GET(req: NextRequest) {
  const buy = process.env.NEXT_PUBLIC_LS_MEMBER_BUY_URL || ''
  const portal = process.env.LEMON_PORTAL_URL || ''

  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect') || '/onboarding?from=membership&redirect=/planner/trip-builder'

  // Prefer explicit buy URL
  if (buy && /^https?:\/\//i.test(buy)) {
    // Optionally append a return parameter if your store supports it
    return NextResponse.redirect(buy, { status: 302 })
  }

  // Fallback: customer portal if configured
  if (portal && /^https?:\/\//i.test(portal)) {
    return NextResponse.redirect(portal, { status: 302 })
  }

  // Last resort: send user to login with redirect back to planner
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  const to = site ? new URL(`/login?redirect=${encodeURIComponent(redirect)}`, site) : new URL(`/login?redirect=${encodeURIComponent(redirect)}`, url.origin)
  return NextResponse.redirect(to, { status: 302 })
}

export const dynamic = 'force-dynamic'
