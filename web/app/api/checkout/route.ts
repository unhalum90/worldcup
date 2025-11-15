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

    if (!user?.email) {
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
