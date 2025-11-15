import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSSRClient } from '@supabase/ssr'

function normalizeToHttps(u: string): string {
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:'
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return u.replace(/^http:\/\//i, 'https://')
  }
}

type LemonCustomer = { id: string, attributes: Record<string, any> }
type LemonOrder = { id: string, attributes: Record<string, any>, relationships?: any }
type LemonOrderItem = { id: string, type: 'order-items', attributes: Record<string, any>, relationships?: any }

async function fetchJSON(url: URL, apiKey: string) {
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Lemon API ${url.pathname} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function findMembershipByEmail(email: string, opts: { apiKey: string; storeId?: string; memberProductIds: string[] }) {
  const { apiKey, storeId, memberProductIds } = opts

  // 1) Find customers by email
  const customersUrl = new URL('https://api.lemonsqueezy.com/v1/customers')
  customersUrl.searchParams.set('filter[email]', email)
  if (storeId) customersUrl.searchParams.set('filter[store_id]', storeId)
  customersUrl.searchParams.set('page[size]', '50')
  const custResp = await fetchJSON(customersUrl, apiKey)
  const customers: LemonCustomer[] = Array.isArray(custResp?.data) ? custResp.data : []
  if (customers.length === 0) {
    return { found: false as const, reason: 'no_customer' as const }
  }

  // 2) For each customer, look for subscriptions first (fast path)
  for (const c of customers) {
    try {
      const subsUrl = new URL('https://api.lemonsqueezy.com/v1/subscriptions')
      subsUrl.searchParams.set('filter[customer_id]', c.id)
      subsUrl.searchParams.set('page[size]', '100')
      const subsResp = await fetchJSON(subsUrl, apiKey)
      const subs = Array.isArray(subsResp?.data) ? subsResp.data : []
      for (const s of subs) {
        const prodId = String(s?.attributes?.product_id ?? '')
        const status = String(s?.attributes?.status ?? '')
        if (prodId && memberProductIds.includes(prodId) && status !== 'expired' && status !== 'cancelled' && status !== 'failed') {
          return { found: true as const, via: 'subscription' as const, productId: prodId, orderId: String(s?.attributes?.order_id ?? ''), productName: String(s?.attributes?.product_name ?? ''), currency: String(s?.attributes?.currency ?? 'USD'), price: Number(s?.attributes?.price ?? 0) / 100 }
        }
      }
    } catch {}
  }

  // 3) If no subs matched, search orders and include order-items to detect product ids
  for (const c of customers) {
    const ordersUrl = new URL('https://api.lemonsqueezy.com/v1/orders')
    // Some filters/sorts are not allowed on /orders for all accounts. Keep it minimal.
    if (storeId) ordersUrl.searchParams.set('filter[store_id]', storeId)
    ordersUrl.searchParams.set('include', 'order-items')
    ordersUrl.searchParams.set('page[size]', '100')
    const ordersResp = await fetchJSON(ordersUrl, apiKey)
    const orders: LemonOrder[] = Array.isArray(ordersResp?.data) ? ordersResp.data : []
    const included: any[] = Array.isArray(ordersResp?.included) ? ordersResp.included : []

    // Identify orders for this customer by email or relationship
    const allowedOrderIds = new Set<string>()
    const targetEmail = email.toLowerCase()
    for (const o of orders) {
      const attrs = o?.attributes || {}
      const oEmail = String(attrs.user_email || attrs.customer_email || '').toLowerCase()
      if (oEmail && oEmail === targetEmail) {
        allowedOrderIds.add(o.id)
        continue
      }
      const relCust = o?.relationships?.customer?.data?.id
      if (relCust && relCust === c.id) {
        allowedOrderIds.add(o.id)
      }
    }

    if (allowedOrderIds.size === 0) continue

    // Build item -> order mapping; keep only items that belong to allowed orders
    const items: LemonOrderItem[] = included.filter((inc) => inc?.type === 'order-items')
    const matchingItem = items.find((it) => {
      const orderId = it?.relationships?.order?.data?.id
      if (!orderId || !allowedOrderIds.has(orderId)) return false
      const pid = String(it?.attributes?.product_id || it?.attributes?.product?.id || '')
      return pid && memberProductIds.includes(pid)
    })

    if (matchingItem) {
      const orderId = matchingItem?.relationships?.order?.data?.id || Array.from(allowedOrderIds)[0] || ''
      const relatedOrder = orders.find((o) => o.id === orderId) || orders[0]
      const productId = String(matchingItem.attributes.product_id || '')
      const productName = String(matchingItem.attributes.product_name || matchingItem.attributes.name || '')
      const currency = String(relatedOrder?.attributes?.currency || 'USD')
      const priceCents = Number(relatedOrder?.attributes?.total || matchingItem.attributes?.price || 0)
      return { found: true as const, via: 'order' as const, productId, orderId, productName, currency, price: priceCents ? priceCents / 100 : 0 }
    }
  }

  return { found: false as const, reason: 'no_order' as const }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const apiKey = process.env.LEMON_API_KEY || ''
  const storeId = process.env.LEMON_STORE_ID || undefined
  const memberIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || process.env.NEXT_PUBLIC_MEMBER_PRODUCT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'missing_lemon_api_key' }, { status: 500 })
  }
  if (memberIds.length === 0) {
    return NextResponse.json({ ok: false, error: 'missing_member_product_ids' }, { status: 500 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}

  // SSR client to read session
  const res = new NextResponse(null, { status: 200 })
  const ssr = createSSRClient(
    normalizeToHttps(supabaseUrl),
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user } } = await ssr.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })
  }

  const email = String(body?.email || user.email || '').trim()
  if (!email) {
    return NextResponse.json({ ok: false, error: 'no_email' }, { status: 400 })
  }

  try {
    const found = await findMembershipByEmail(email, { apiKey, storeId, memberProductIds: memberIds })
    if (!found.found) {
      return NextResponse.json({ ok: false, error: 'not_found', details: found }, { status: 404 })
    }

    // Update profile flags and upsert purchase for audit
    const svcUrl = normalizeToHttps(supabaseUrl)
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''
    if (!svcKey) {
      // As a fallback, set minimal flags via RLS-limited update using SSR client (may fail depending on policies)
      await ssr.from('profiles').update({
        account_level: 'member',
        subscription_tier: 'premium',
        subscription_status: 'active',
        is_member: true,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id)
    } else {
      // Use service role for guaranteed write
      const resp = await fetch(`${svcUrl}/rest/v1/profiles?user_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          apikey: svcKey,
          Authorization: `Bearer ${svcKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          account_level: 'member',
          subscription_tier: 'premium',
          subscription_status: 'active',
          is_member: true,
          updated_at: new Date().toISOString(),
        }),
      })
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '')
        throw new Error(`profiles update failed: ${resp.status} ${txt}`)
      }
    }

    // Upsert purchase record (best-effort)
    try {
      const payload = { manual_activation: true, source: 'activate_api', via: (found as any).via }
      await ssr.from('purchases').upsert({
        user_id: user.id,
        email,
        ls_order_id: (found as any).orderId || null,
        product_id: (found as any).productId || memberIds[0],
        product_name: (found as any).productName || 'Membership',
        price: typeof (found as any).price === 'number' ? (found as any).price : 0,
        currency: (found as any).currency || 'USD',
        status: 'completed',
        payload,
      }, { onConflict: 'ls_order_id' })
    } catch {}

    return NextResponse.json({ ok: true, user_id: user.id, email, product_id: (found as any).productId || memberIds[0] })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'activate_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
