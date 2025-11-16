import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Service key must NOT use the SUPABASE_ prefix in Secrets UI; support common names
    const serviceRole =
      Deno.env.get('SERVICE_ROLE_KEY') ||
      Deno.env.get('SERVICE_ROLE') ||
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      Deno.env.get('SUPABASE_SERVICE_ROLE')
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
      // Coerce LS values to strings for text columns
      const lsCustomerId = customerId != null ? String(customerId) : undefined

      // Try update by user_id first
      const { data: updatedById, error: upErrById } = await supabase
        .from('profiles')
        .update({
          is_member: true,
          account_level: 'member',
          member_since: new Date().toISOString(),
          ls_customer_id: lsCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select('user_id')

      if (upErrById) {
        console.error('[lemon-webhook] Profile update (by user_id) error', upErrById)
        // Do not surface 500 to Lemon; log and continue
      }

      // If no row matched, fall back to email match
      let matched = Array.isArray(updatedById) && updatedById.length > 0

      if (!matched) {
        if (userEmail) {
          const { data: updatedByEmail, error: upErrByEmail } = await supabase
            .from('profiles')
            .update({
              is_member: true,
              account_level: 'member',
              member_since: new Date().toISOString(),
              ls_customer_id: lsCustomerId,
              updated_at: new Date().toISOString(),
            })
            .eq('email', userEmail)
            .select('user_id')

          if (upErrByEmail) {
            console.error('[lemon-webhook] Profile update (by email) error', upErrByEmail)
            // Continue; don't block LS webhook retries if email path fails
          }
          matched = Array.isArray(updatedByEmail) && updatedByEmail.length > 0
        } else {
          console.warn('[lemon-webhook] No matching profile by user_id and no userEmail provided; skipping profile update')
        }
      }

      // If still not matched, create or upsert a profile row
      if (!matched) {
        try {
          await supabase
            .from('profiles')
            .upsert(
              {
                user_id: userId,
                email: userEmail ?? null,
                is_member: true,
                account_level: 'member',
                member_since: new Date().toISOString(),
                ls_customer_id: lsCustomerId,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            )
        } catch (e) {
          console.error('[lemon-webhook] Profile upsert failed', e)
        }
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
              price: priceCents / 100,
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
    // Avoid 500 loops from Lemon retries; log and ack
    return new Response(JSON.stringify({ ok: false, error: 'processing_failed' }), { status: 200 })
  }
})
