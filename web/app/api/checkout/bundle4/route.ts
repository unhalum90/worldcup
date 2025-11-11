import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const buy = process.env.NEXT_PUBLIC_LS_BUNDLE4_BUY_URL || ''
  const portal = process.env.LEMON_PORTAL_URL || ''

  if (buy && /^https?:\/\//i.test(buy)) {
    return NextResponse.redirect(buy, { status: 302 })
  }

  if (portal && /^https?:\/\//i.test(portal)) {
    return NextResponse.redirect(portal, { status: 302 })
  }

  const url = new URL(req.url)
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  const to = site ? new URL('/guides', site) : new URL('/guides', url.origin)
  return NextResponse.redirect(to, { status: 302 })
}

export const dynamic = 'force-dynamic'
