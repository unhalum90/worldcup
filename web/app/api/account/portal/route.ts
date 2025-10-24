import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.LEMON_API_KEY
  const fallbackUrl = process.env.LEMON_PORTAL_URL

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // no body is fine
  }
  const customer_id = body?.customer_id as string | undefined

  if (apiKey && customer_id) {
    try {
      const res = await fetch('https://api.lemonsqueezy.com/v1/customer-portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ customer_id }),
      })
      const data = await res.json()
      const url = data?.data?.attributes?.url
      if (url) return NextResponse.json({ url })
    } catch (e) {
      // fall through to fallback
    }
  }

  if (fallbackUrl) {
    return NextResponse.json({ url: fallbackUrl })
  }

  return NextResponse.json({ error: 'Portal unavailable' }, { status: 400 })
}
