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
  const attrs = payload?.data?.attributes || {}
  const email: string | undefined = attrs?.user_email || attrs?.customer_email || attrs?.email
  const product_id: string | undefined = attrs?.first_order_item?.product_id || attrs?.product_id

  try {
    const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (email && product_id && memberIds.includes(String(product_id))) {
      await supabaseServer
        .from('profiles')
        .update({ is_member: true, account_level: 'member', subscription_tier: 'premium', subscription_status: 'active', updated_at: new Date().toISOString() })
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

    if (email && (eventName === 'subscription_cancelled' || eventName === 'subscription_expired')) {
      await supabaseServer
        .from('profiles')
        .update({ is_member: false, subscription_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('email', email)
    }
  } catch (e) {
    console.error('lemonsqueezy webhook error', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
