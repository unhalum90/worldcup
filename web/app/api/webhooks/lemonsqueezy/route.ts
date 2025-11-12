import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabaseServer'
import { addSubscriberToGroup } from '@/lib/mailerlite'

function verifySignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret || !signature) return false
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
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || process.env.LEMON_WEBHOOK_SECRET
  let rawBody = ''
  try { rawBody = await req.text() } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }

  const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  let payload: any
  try { payload = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const eventName: string = payload?.event_name || payload?.meta?.event_name || 'unknown'
  const data = payload?.data
  const attrs = data?.attributes || {}
  const email: string | undefined = attrs?.user_email || attrs?.customer_email || attrs?.email
  const product_id: string | undefined = attrs?.first_order_item?.product_id || attrs?.product_id
  const product_name: string | undefined = attrs?.first_order_item?.product_name || attrs?.product_name || attrs?.name
  const ls_order_id: string | undefined = String(data?.id || attrs?.identifier || attrs?.order_id || '') || undefined
  const priceRaw: number | undefined = attrs?.total || attrs?.subtotal || attrs?.price
  const currency: string | undefined = (attrs?.currency || 'USD') as string

  // Try to capture custom user_id passed from checkout URLs or API-created sessions
  const custom: any =
    (attrs && (attrs.custom || attrs.checkout_data?.custom)) ||
    payload?.meta?.custom ||
    data?.attributes?.custom ||
    null
  const customUserId: string | undefined = custom?.user_id || custom?.userId || custom?.uid

  const statusMap: Record<string, string> = {
    order_created: 'completed',
    subscription_created: 'completed',
    subscription_updated: 'completed',
    refund_created: 'refunded',
  }
  const status = (statusMap[eventName] || 'completed') as 'pending' | 'completed' | 'refunded' | 'failed' | 'void'

  try {
    // 1) Upsert purchase record for order and subscription events
    if (email && (eventName === 'order_created' || eventName.startsWith('subscription_') || eventName === 'refund_created')) {
      const upsertBody: any = {
        ls_order_id,
        email,
        product_id,
        product_name,
        price: typeof priceRaw === 'number' ? Number(priceRaw) / 100 : null,
        currency,
        status,
        payload,
      }

      // Try map to user_id via profiles by email
      try {
        if (customUserId) {
          upsertBody.user_id = customUserId
        } else {
          const { data: prof } = await supabaseServer
            .from('profiles')
            .select('user_id')
            .eq('email', email)
            .maybeSingle()
          if (prof?.user_id) upsertBody.user_id = prof.user_id
        }
      } catch {
        // non-fatal
      }

      if (ls_order_id) {
        await supabaseServer.from('purchases').upsert(upsertBody, { onConflict: 'ls_order_id' })
      } else {
        await supabaseServer.from('purchases').insert(upsertBody)
      }
    }

    // 2) Update membership flags for qualifying products
    const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if ((email || customUserId) && product_id && memberIds.includes(String(product_id))) {
      const body: any = {
        is_member: true,
        account_level: 'member',
        subscription_tier: 'premium',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      }
      if (customUserId) body.user_id = customUserId
      if (email) body.email = email

      // Prefer upsert to ensure profile row exists
      if (customUserId) {
        await supabaseServer.from('profiles').upsert(body, { onConflict: 'user_id' })
      } else if (email) {
        // upsert by email requires unique index on email (added in migration 018)
        await supabaseServer.from('profiles').upsert(body, { onConflict: 'email' })
      }

      // Add to MailerLite membership group (best-effort)
      const mlGroup = process.env.MAILERLITE_MEMBER_GROUP_ID || process.env.MAILERLITE_NEWSLETTER_GROUP_ID
      if (mlGroup && email) {
        try {
          const res = await addSubscriberToGroup(email, mlGroup)
          if (!res.ok) console.warn('MailerLite add failed', res)
        } catch (e) {
          console.warn('MailerLite add threw', e)
        }
      }
    }

    if ((email || customUserId) && (eventName === 'subscription_cancelled' || eventName === 'subscription_expired')) {
      const body: any = { is_member: false, subscription_status: 'cancelled', updated_at: new Date().toISOString() }
      if (customUserId) {
        await supabaseServer.from('profiles').upsert({ user_id: customUserId, email, ...body }, { onConflict: 'user_id' })
      } else if (email) {
        await supabaseServer.from('profiles').upsert({ email, ...body }, { onConflict: 'email' })
      }
    }
  } catch (e) {
    console.error('lemonsqueezy webhook error', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
