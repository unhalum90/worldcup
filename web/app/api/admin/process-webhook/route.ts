import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabaseServer'
import { addSubscriberToGroup } from '@/lib/mailerlite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// TEMPORARY ADMIN ENDPOINT - Password protected
// This bypasses bot protection since you'll call it from your browser while logged in
// Delete this file once webhooks are working

const ADMIN_PASSWORD = process.env.ADMIN_WEBHOOK_PASSWORD || 'changeme123'

export async function POST(req: NextRequest) {
  console.log('🔧 Manual webhook processing started')
  
  // Simple password protection
  const authHeader = req.headers.get('authorization')
  const password = authHeader?.replace('Bearer ', '')
  
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName: string = payload?.meta?.event_name || payload?.event_name || 'unknown'
  const data = payload?.data
  const attrs = data?.attributes || {}
  const meta = payload?.meta || {}
  const customData = meta?.custom_data || {}

  console.log('📋 Event:', eventName)
  console.log('📋 Product ID:', attrs?.first_order_item?.product_id || attrs?.product_id)
  console.log('📋 Email:', attrs?.user_email || attrs?.customer_email)
  console.log('📋 Custom Data:', customData)

  const ls_order_id: string | undefined = String(data?.id || attrs?.identifier || attrs?.order_id || '') || undefined
  const email: string | undefined = attrs?.user_email || attrs?.customer_email || attrs?.email || undefined
  const product_id: string | undefined = String(attrs?.first_order_item?.product_id || attrs?.product_id || '')
  const product_name: string | undefined = attrs?.first_order_item?.product_name || attrs?.product_name || attrs?.name || undefined
  const price: number | undefined = attrs?.total || attrs?.subtotal || attrs?.price || undefined
  const currency: string | undefined = (attrs?.currency || 'USD') as string
  const custom_user_id: string | undefined = customData?.user_id || undefined

  const statusMap: Record<string, string> = {
    order_created: 'completed',
    subscription_created: 'completed',
    subscription_updated: 'completed',
    order_refunded: 'refunded',
    refund_created: 'refunded',
  }
  const status = (statusMap[eventName] || 'completed') as 'pending' | 'completed' | 'refunded' | 'failed' | 'void'

  // Try to map to user by custom_data.user_id first, then email
  let user_id: string | null = null

  try {
    const upsertBody: any = {
      ls_order_id,
      email,
      product_id,
      product_name,
      price: price ? Number(price) / 100 : null,
      currency,
      status,
      payload,
    }
    
    if (custom_user_id) {
      user_id = custom_user_id
      console.log('👤 Using user_id from custom_data:', user_id)
    } else if (email) {
      const { data: prof, error: profileError } = await supabaseServer
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle()
      
      if (profileError) {
        console.error('Profile lookup error:', profileError)
      }
      
      if (prof?.user_id) {
        user_id = prof.user_id
        console.log('👤 Found user by email:', user_id)
      } else {
        console.log('👤 No user found for email:', email)
      }
    }

    if (user_id) upsertBody.user_id = user_id

    if (ls_order_id) {
      const { error: upsertError } = await supabaseServer
        .from('purchases')
        .upsert(upsertBody, { onConflict: 'ls_order_id' })
      
      if (upsertError) {
        console.error('Purchase upsert error:', upsertError)
        throw upsertError
      }
      console.log('💾 Purchase upserted:', ls_order_id)
    } else {
      const { error: insertError } = await supabaseServer
        .from('purchases')
        .insert(upsertBody)
      
      if (insertError) {
        console.error('Purchase insert error:', insertError)
        throw insertError
      }
      console.log('💾 Purchase inserted')
    }

    const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    console.log('🎫 Member product IDs:', memberIds)
    console.log('🎫 Current product ID:', product_id)

    if (product_id && memberIds.includes(String(product_id)) && user_id) {
      console.log('🎉 Updating user to member status for user_id:', user_id)
      
      const { error: updateError } = await supabaseServer
        .from('profiles')
        .update({ 
          account_level: 'member', 
          subscription_tier: 'premium', 
          subscription_status: 'active', 
          is_member: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user_id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      } else {
        console.log('✅ Profile updated to member for user_id:', user_id)
      }

      if (email) {
        const mlGroup = process.env.MAILERLITE_MEMBER_GROUP_ID || process.env.MAILERLITE_NEWSLETTER_GROUP_ID
        if (mlGroup) {
          try {
            console.log('📧 Adding to MailerLite group:', mlGroup)
            const res = await addSubscriberToGroup(email, mlGroup)
            if (!res.ok) {
              console.warn('MailerLite add failed:', res)
            } else {
              console.log('✅ Added to MailerLite')
            }
          } catch (e) {
            console.warn('MailerLite add threw:', e)
          }
        }
      }
    }
  } catch (e) {
    console.error('❌ Webhook processing error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: 'processing_failed',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 })
  }

  console.log('✅ Manual webhook processed successfully')
  return NextResponse.json({ 
    ok: true, 
    processed: {
      order_id: ls_order_id,
      user_id: user_id,
      email: email,
      product_id: product_id,
      status: status
    }
  })
}
