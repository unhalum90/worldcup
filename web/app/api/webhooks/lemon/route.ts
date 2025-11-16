import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabaseServer'
import { addSubscriberToGroup } from '@/lib/mailerlite'

// Tell Vercel this is a webhook endpoint that should run on Node.js runtime
export const runtime = 'nodejs'
// Disable static optimization for webhooks
export const dynamic = 'force-dynamic'
// CRITICAL: Bypass Vercel bot protection for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}
// Add special headers to help bypass bot protection
export const preferredRegion = 'auto'

function verifySignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret) {
    console.error('No webhook secret configured')
    return false
  }
  if (!signature) {
    console.error('No signature header found')
    return false
  }
  
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody, 'utf8')
    const digest = hmac.digest('hex')
    
    // FIX: Ensure both buffers are the same length before comparing
    if (signature.length !== digest.length) {
      console.error('Signature length mismatch')
      return false
    }
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received:', new Date().toISOString())
  
  const secret = process.env.LEMON_WEBHOOK_SECRET
  
  // Log for debugging (remove in production)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  let rawBody = ''
  try {
    rawBody = await req.text()
    console.log('📦 Body length:', rawBody.length)
  } catch (e) {
    console.error('Failed to read body:', e)
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')
  console.log('🔐 Signature present:', !!signature)

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('❌ Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  console.log('✅ Signature verified')

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (e) {
    console.error('Failed to parse JSON:', e)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Lemon Squeezy payloads typically include event_name and data
  const eventName: string = payload?.meta?.event_name || payload?.event_name || 'unknown'
  const data = payload?.data
  const attrs = data?.attributes || {}
  const meta = payload?.meta || {}
  const customData = meta?.custom_data || {}

  console.log('📋 Event:', eventName)
  console.log('📋 Product ID:', attrs?.first_order_item?.product_id || attrs?.product_id)
  console.log('📋 Email:', attrs?.user_email || attrs?.customer_email)
  console.log('📋 Custom Data:', customData)

  // Extract basics (best-effort, payload shape varies by event)
  const ls_order_id: string | undefined = String(data?.id || attrs?.identifier || attrs?.order_id || '') || undefined
  const email: string | undefined = attrs?.user_email || attrs?.customer_email || attrs?.email || undefined
  const product_id: string | undefined = String(attrs?.first_order_item?.product_id || attrs?.product_id || '')
  const product_name: string | undefined = attrs?.first_order_item?.product_name || attrs?.product_name || attrs?.name || undefined
  const price: number | undefined = attrs?.total || attrs?.subtotal || attrs?.price || undefined
  const currency: string | undefined = (attrs?.currency || 'USD') as string
  
  // CRITICAL: Use user_id from custom_data if available (most reliable)
  const custom_user_id: string | undefined = customData?.user_id || undefined

  const statusMap: Record<string, string> = {
    order_created: 'completed',
    subscription_created: 'completed',
    subscription_updated: 'completed',
    order_refunded: 'refunded',
    refund_created: 'refunded',
  }
  const status = (statusMap[eventName] || 'completed') as 'pending' | 'completed' | 'refunded' | 'failed' | 'void'

  // Insert/Upsert purchase
  try {
    const upsertBody: any = {
      ls_order_id,
      email,
      product_id,
      product_name,
      price: price ? Number(price) / 100 : null, // Lemon often uses cents
      currency,
      status,
      payload,
    }

    // Try to map to user by custom_data.user_id first, then email
    let user_id: string | null = null
    
    // Priority 1: Use user_id from custom_data (most reliable)
    if (custom_user_id) {
      user_id = custom_user_id
      console.log('👤 Using user_id from custom_data:', user_id)
    }
    // Priority 2: Lookup by email
    else if (email) {
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

    // Update profile membership if product qualifies
    const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    console.log('🎫 Member product IDs:', memberIds)
    console.log('🎫 Current product ID:', product_id)

    if (product_id && memberIds.includes(String(product_id)) && user_id) {
      console.log('🎉 Updating user to member status for user_id:', user_id)
      
      const { data, error: updateError } = await supabaseServer
        .from('profiles')
        .update({ 
          is_member: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user_id)

      if (updateError) {
        console.error('Profile update error:', updateError)
      } else {
        console.log('✅ Profile updated to member for user_id:', user_id)
      }

      // Add to MailerLite membership group (best-effort)
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
    return NextResponse.json({ ok: false, error: 'processing_failed' }, { status: 500 })
  }

  console.log('✅ Webhook processed successfully')
  return NextResponse.json({ ok: true })
}


