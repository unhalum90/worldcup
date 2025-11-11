import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabaseServer'
import { addSubscriberToGroup } from '@/lib/mailerlite'

function verifySignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret) return false
  if (!signature) return false
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody, 'utf8')
    const digest = hmac.digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMON_WEBHOOK_SECRET
  let rawBody = ''
  try {
    rawBody = await req.text()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Lemon Squeezy payloads typically include event_name and data
  const eventName: string = payload?.event_name || payload?.meta?.event_name || 'unknown'
  const data = payload?.data
  const attrs = data?.attributes || {}

  // Extract basics (best-effort, payload shape varies by event)
  const ls_order_id: string | undefined = String(data?.id || attrs?.identifier || attrs?.order_id || '') || undefined
  const email: string | undefined = attrs?.user_email || attrs?.customer_email || attrs?.email || undefined
  const product_id: string | undefined = attrs?.first_order_item?.product_id || attrs?.product_id || undefined
  const product_name: string | undefined = attrs?.first_order_item?.product_name || attrs?.product_name || attrs?.name || undefined
  const price: number | undefined = attrs?.total || attrs?.subtotal || attrs?.price || undefined
  const currency: string | undefined = (attrs?.currency || 'USD') as string

  const statusMap: Record<string, string> = {
    order_created: 'completed',
    subscription_created: 'completed',
    subscription_updated: 'completed',
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

    // Try to map to user by email
    let user_id: string | null = null
    if (email) {
      const { data: prof } = await supabaseServer
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle()
      if (prof?.user_id) user_id = prof.user_id
    }

    if (user_id) upsertBody.user_id = user_id

    if (ls_order_id) {
      await supabaseServer.from('purchases').upsert(upsertBody, { onConflict: 'ls_order_id' })
    } else {
      await supabaseServer.from('purchases').insert(upsertBody)
    }

    // Update profile membership if product qualifies
    const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (product_id && memberIds.includes(String(product_id)) && email) {
      await supabaseServer
        .from('profiles')
        .update({ account_level: 'member', subscription_tier: 'premium', subscription_status: 'active', is_member: true, updated_at: new Date().toISOString() })
        .eq('email', email)

      // Add to MailerLite membership group (best-effort)
      const mlGroup = process.env.MAILERLITE_MEMBER_GROUP_ID || process.env.MAILERLITE_NEWSLETTER_GROUP_ID
      if (mlGroup) {
        try {
          const res = await addSubscriberToGroup(email, mlGroup)
          if (!res.ok) console.warn('MailerLite add failed', res)
        } catch (e) {
          console.warn('MailerLite add threw', e)
        }
      }
    }
  } catch (e) {
    console.error('Webhook processing error', e)
    return NextResponse.json({ ok: false, error: 'processing_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
