// web/app/api/membership/activate/route.ts
// Handles both GET (Lemon Squeezy redirect) and POST (manual activation) requests
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin' // Service Role client

const LEMON_API_KEY = process.env.LEMON_API_KEY!
// Support both naming conventions for product ID
const MEMBERSHIP_PRODUCT_ID = Number(
  process.env.NEXT_PUBLIC_LS_MEMBER_PRODUCT_ID || 
  process.env.LEMON_MEMBER_PRODUCT_IDS?.split(',')[0] || 
  '0'
)
const DEFAULT_REDIRECT = process.env.NEXT_PUBLIC_MEMBER_DEFAULT_REDIRECT || '/planner/trip-builder'

// Types for Lemon Squeezy API response structure
type LemonOrder = {
  id: string
  type: string
  attributes: {
    status: string
    user_email: string | null
    email: string | null
    customer_id?: string
    first_order_item?: {
      product_id: number
      product_name: string
    }
    total?: number
    currency?: string
  }
}

type LemonOrderItem = {
  id: string
  type: string
  attributes: {
    product_id: number
    variant_id: number
  }
}

// GET handler for Lemon Squeezy redirect flow
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get('order_id')
  const emailFromQuery = url.searchParams.get('email')
  const redirectPath = url.searchParams.get('redirect') || DEFAULT_REDIRECT
  
  // NOTE: Lemon Squeezy must be configured to redirect here with these params.
  if (!orderId) {
    return NextResponse.redirect(new URL(`/memberships?error=missing-order`, req.url))
  }

  try {
    // 1. Fetch order from Lemon Squeezy (includes order-items for verification)
    const orderRes = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderId}?include=order-items`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_API_KEY}`,
          Accept: 'application/vnd.api+json'
        },
        cache: 'no-store'
      }
    )

    if (!orderRes.ok) {
      console.error('Lemon order fetch failed', orderRes.status)
      return NextResponse.redirect(new URL(`/memberships?error=order-failed`, req.url))
    }

    const orderJson = await orderRes.json()
    const order = orderJson.data as LemonOrder
    const orderEmail =
      (order.attributes.user_email || order.attributes.email || emailFromQuery || '')
        .trim()
        .toLowerCase()

    if (order.attributes.status !== 'paid' || !orderEmail) {
      return NextResponse.redirect(new URL(`/memberships?error=not-paid`, req.url))
    }

    // 2. Extract and verify product_id from included order items
    const orderItems = (orderJson.included as (LemonOrderItem | LemonOrder)[])
      .filter(item => item.type === 'order-items') as LemonOrderItem[]

    const isMembershipProduct = orderItems.some(item =>
        item.attributes.product_id === MEMBERSHIP_PRODUCT_ID
    )

    if (MEMBERSHIP_PRODUCT_ID && !isMembershipProduct) {
      return NextResponse.redirect(new URL(`/memberships?error=wrong-product`, req.url))
    }

    // 3. Update Supabase profile using admin client (Service Role)
    const updateData = {
      is_member: true,
      account_level: 'member',
      member_since: new Date().toISOString()
    }
    
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('email', orderEmail)

    if (updateErr) {
      console.error('Supabase profile update error', updateErr)
      // Log the error but continue to redirect the user to prevent bad UX
    }

    // 4. Redirect user into the app
    const safeRedirect = redirectPath.startsWith('/') ? redirectPath : DEFAULT_REDIRECT
    return NextResponse.redirect(new URL(safeRedirect, req.url))
  } catch (err) {
    console.error('Membership activation exception', err)
    return NextResponse.redirect(new URL(`/memberships?error=exception`, req.url))
  }
}

// POST handler for manual activation flow (existing functionality)
export async function POST(req: NextRequest) {
  try {
    const { email, orderId } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    const memberProductIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map(id => id.trim())

    if (!LEMON_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Checking purchases for:', email)

    // Check Lemon Squeezy for orders
    const url = new URL('https://api.lemonsqueezy.com/v1/orders')
    url.searchParams.set('filter[user_email]', email)
    url.searchParams.set('filter[status]', 'paid')

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMON_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('Lemon API error:', response.status)
      return NextResponse.json(
        { error: 'Failed to verify purchase' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const orders = data.data || []

    console.log(`📦 Found ${orders.length} orders`)

    // Find a valid membership order
    const validOrder = orders.find((order: any) => {
      const productId = String(order.attributes?.first_order_item?.product_id || '')
      return memberProductIds.includes(productId)
    })

    if (!validOrder) {
      console.log('❌ No valid membership order found')
      return NextResponse.json({
        success: false,
        message: 'No membership purchase found for this email'
      })
    }

    console.log('✅ Valid order found:', validOrder.id)

    // Update profile using admin client (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_member: true,
        member_since: new Date().toISOString(),
        ls_customer_id: validOrder.attributes?.customer_id,
      })
      .eq('email', email)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to activate membership' },
        { status: 500 }
      )
    }

    // Record purchase
    const purchaseData = {
      email,
      ls_order_id: validOrder.id,
      product_id: String(validOrder.attributes?.first_order_item?.product_id),
      product_name: validOrder.attributes?.first_order_item?.product_name,
      price: validOrder.attributes?.total ? Number(validOrder.attributes.total) / 100 : null,
      currency: validOrder.attributes?.currency || 'USD',
      status: 'completed',
      payload: validOrder,
    }

    await supabaseAdmin
      .from('purchases')
      .upsert(purchaseData, { onConflict: 'ls_order_id' })

    console.log('✅ Membership activated for:', email)

    return NextResponse.json({
      success: true,
      message: 'Membership activated successfully'
    })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 }
    )
  }
}
