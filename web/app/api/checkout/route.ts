import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCheckout, ensureLemonSqueezyConfigured } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = process.env.LEMONSQUEEZY_MEMBERSHIP_VARIANT_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  let redirectPath: string | undefined
  try {
    const body = await request.json()
    if (typeof body?.redirect === 'string' && body.redirect.startsWith('/')) {
      redirectPath = body.redirect
    }
  } catch {
    // no body provided – fallback handled below
  }

  if (!storeId || !variantId) {
    console.error('Missing Lemon Squeezy configuration: store or variant ID not set.')
    return new NextResponse(JSON.stringify({ error: 'Configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!siteUrl) {
    console.error('Missing NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_BASE_URL) environment variable.')
    return new NextResponse(JSON.stringify({ error: 'Configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!apiKey) {
    console.error('Missing LEMONSQUEEZY_API_KEY environment variable.')
    return new NextResponse(JSON.stringify({ error: 'Configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    ensureLemonSqueezyConfigured()

    const successUrl = new URL('/membership/activate', siteUrl)
    const cancelUrl = new URL('/membership/paywall', siteUrl)
    if (redirectPath) {
      successUrl.searchParams.set('redirect', redirectPath)
      cancelUrl.searchParams.set('redirect', redirectPath)
    }

    const checkoutResponse = await createCheckout(Number(storeId), Number(variantId), {
      checkoutData: {
        custom: {
          user_id: user.id,
          user_email: user.email,
        },
      },
      checkoutOptions: {
        successUrl: successUrl.toString(),
        cancelUrl: cancelUrl.toString(),
      } as Record<string, unknown>,
    })

    if (checkoutResponse.error || !checkoutResponse.data) {
      throw checkoutResponse.error ?? new Error('Failed to create checkout session')
    }

    const url = checkoutResponse.data.data.attributes.url

    return new NextResponse(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
