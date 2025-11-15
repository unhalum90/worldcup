import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('[Checkout] auth.getUser()', {
      hasUser: !!user,
      email: user?.email,
      error: error?.message,
      cookieNames: req.cookies.getAll().map(c => c.name),
    })

    let effectiveUser = user

    // If server-side cookies didn't carry a session, allow a client-provided
    // Bearer token to validate the user via Supabase's auth v1 user endpoint.
    if (!effectiveUser?.email) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1]
          const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
          const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          })

          if (userResp.ok) {
            const userJson = await userResp.json()
            // userJson is the user object
            effectiveUser = userJson as any
            console.log('[Checkout] verified user via auth header', { email: effectiveUser?.email, id: effectiveUser?.id })
          } else {
            console.log('[Checkout] auth header verification failed', { status: userResp.status })
          }
        } catch (e) {
          console.error('[Checkout] auth header verification error', e)
        }
      }
    }

    if (!effectiveUser?.email) {
      return NextResponse.json(
        { error: 'Must be logged in' },
        { status: 401 }
      )
    }

  const storeId = process.env.LEMON_STORE_ID
  const productId = process.env.LEMON_MEMBER_PRODUCT_IDS?.split(',')[0]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!storeId || !productId) {
      return NextResponse.json(
        { error: 'Store not configured' },
        { status: 500 }
      )
    }

  // Create Lemon Squeezy checkout
  const checkoutUrl = new URL(`https://worldcup26fanzone.lemonsqueezy.com/checkout/buy/${productId}`)
    
    checkoutUrl.searchParams.set('checkout[email]', user.email)
    checkoutUrl.searchParams.set('checkout[custom][user_id]', user.id)
    
    // Success URL goes to activation page
    checkoutUrl.searchParams.set(
      'checkout[success_url]',
      `${siteUrl}/membership/activate?order_id={order_id}`
    )

    const result = { url: checkoutUrl.toString() }
    console.log('[Checkout] returning checkout URL', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
