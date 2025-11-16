import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from 'https://deno.land/std@0.177.0/crypto/mod.ts'

function stripPrefix(sig: string): string {
  const s = sig.trim()
  return s.startsWith('sha256=') ? s.slice(7) : s
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.toLowerCase()
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16)
  }
  return bytes
}

async function verifySignature(request: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET') || Deno.env.get('LEMON_WEBHOOK_SECRET')
  if (!secret) return false

  const headerVal = request.headers.get('x-signature') || request.headers.get('X-Signature')
  if (!headerVal) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  // Lemon typically sends a hex digest; support hex and base64 for safety
  const raw = stripPrefix(headerVal)
  let signatureBytes: Uint8Array
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
    signatureBytes = hexToBytes(raw)
  } else {
    try {
      const bin = atob(raw)
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      signatureBytes = arr
    } catch {
      return false
    }
  }

  const ok = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(body))
  return ok
}

type LemonPayload = {
  meta?: { event_name?: string; custom_data?: Record<string, any> }
  data?: { id?: string; attributes?: Record<string, any> }
  included?: any[]
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 })
  }

  const body = await req.text()

  const valid = await verifySignature(req, body)
  if (!valid) {
    console.warn('[lemon-webhook] Signature verification failed')
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
  }

  try {
    const payload = JSON.parse(body) as LemonPayload
    const event = payload?.meta?.event_name || 'unknown'
    const attrs = payload?.data?.attributes || {}

    // Prefer meta.custom_data from checkout/member endpoint; fallback to attributes.checkout_data.custom
    const custom = (payload?.meta?.custom_data || attrs?.checkout_data?.custom || {}) as Record<string, any>
    const userId: string | undefined = custom.user_id || custom.userId
    const userEmail: string | undefined = attrs.user_email || attrs.customer_email || custom.user_email

    if (!userId) {
      console.error('[lemon-webhook] Missing user_id in custom data. Event:', event)
      return new Response(JSON.stringify({ message: 'user_id missing' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE')
    if (!supabaseUrl || !serviceRole) {
      console.error('[lemon-webhook] Missing Supabase service credentials')
      return new Response(JSON.stringify({ message: 'server misconfigured' }), { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })

    // Pull product details from common locations
    const first = attrs?.first_order_item || {}
    const productId = String(first?.product_id ?? attrs?.product_id ?? '')
    const productName = first?.product_name ?? attrs?.product_name ?? attrs?.name ?? null
    const variantId = first?.variant_id ?? attrs?.variant_id ?? null
    const customerId = attrs?.customer_id ?? attrs?.customer?.id ?? null
    const lsOrderId = String(payload?.data?.id ?? attrs?.identifier ?? attrs?.order_id ?? '')
    const priceCents = Number(attrs?.total ?? attrs?.subtotal ?? 0)
    const currency = (attrs?.currency || 'USD') as string

    // Activate membership for successful purchase events
    const activateEvents = new Set(['order_created', 'subscription_created', 'subscription_updated'])
    if (activateEvents.has(event)) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          is_member: true,
          account_level: 'member',
          member_since: new Date().toISOString(),
          ls_customer_id: customerId ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (upErr) {
        console.error('[lemon-webhook] Profile update error', upErr)
        return new Response(JSON.stringify({ error: 'profile_update_failed' }), { status: 500 })
      }

      // Best-effort purchase upsert
      try {
        await supabase
          .from('purchases')
          .upsert(
            {
              user_id: userId,
              email: userEmail ?? null,
              ls_order_id: lsOrderId || null,
              product_id: productId || null,
              product_name: productName || null,
              price: priceCents ? priceCents / 100 : null,
              currency,
              status: 'completed',
              payload: payload as unknown as Record<string, unknown>,
            },
            { onConflict: 'ls_order_id' }
          )
      } catch (e) {
        console.warn('[lemon-webhook] Purchase upsert warning:', e)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    console.error('[lemon-webhook] Exception:', e)
    return new Response(JSON.stringify({ error: 'processing_failed' }), { status: 500 })
  }
})

