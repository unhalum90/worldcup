import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, orderId } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LEMON_API_KEY
    const memberProductIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map(id => id.trim())

    if (!apiKey) {
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
        'Authorization': `Bearer ${apiKey}`,
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
    const supabase = createAdminClient()

    const { error: updateError } = await supabase
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

    await supabase
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
