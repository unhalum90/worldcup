import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

const TEST_USERS = [
  { user_id: '6871a597-4c5e-43b3-a3c9-42e956e3b343', email: 'echamberlin@me.com', account_level: 'member', subscription_tier: 'premium', subscription_status: 'active' },
  { user_id: 'a5974b16-ade2-4721-a0ba-67cf48eab0cc', email: 'worldcup26fanzone@gmail.com', account_level: 'city_bundle', subscription_tier: 'free', subscription_status: 'active' },
  { user_id: 'd502aed4-47f0-46f9-8a72-2bdebe74d748', email: 'eric@xrtoolsfored.com', account_level: 'free', subscription_tier: 'free', subscription_status: 'active' },
]

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || (await req.json().catch(() => ({}))).token
  if (!process.env.ADMIN_SEED_TOKEN || token !== process.env.ADMIN_SEED_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    if (!supabaseServer) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }
    const svc = supabaseServer
    // Upsert profiles
    for (const u of TEST_USERS) {
      await svc
        .from('profiles')
        .upsert({
          user_id: u.user_id,
          email: u.email,
          role: 'user',
          account_level: u.account_level,
          subscription_tier: u.subscription_tier,
          subscription_status: u.subscription_status,
        }, { onConflict: 'user_id' })
    }

    // Seed purchases
    const purchases = [
      {
        user_id: TEST_USERS[0].user_id,
        email: TEST_USERS[0].email,
        product_id: 'member-annual-001',
        product_name: 'WC26 Membership (Annual)',
        price: 29.99,
        currency: 'USD',
        status: 'completed',
        ls_order_id: 'LS-TEST-0001',
        purchase_date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      },
      {
        user_id: TEST_USERS[1].user_id,
        email: TEST_USERS[1].email,
        product_id: 'bundle-4city-001',
        product_name: '4-City Bundle (Dallas, Atlanta, LA, Vancouver)',
        price: 9.99,
        currency: 'USD',
        status: 'completed',
        ls_order_id: 'LS-TEST-0002',
        purchase_date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      },
      {
        user_id: TEST_USERS[1].user_id,
        email: TEST_USERS[1].email,
        product_id: 'bundle-2city-002',
        product_name: '2-City Bundle (NYC, Boston)',
        price: 4.99,
        currency: 'USD',
        status: 'refunded',
        ls_order_id: 'LS-TEST-0003',
        purchase_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
      {
        user_id: null,
        email: TEST_USERS[2].email,
        product_id: 'pdf-city-dal-001',
        product_name: 'Dallas City Guide (PDF)',
        price: 0,
        currency: 'USD',
        status: 'completed',
        ls_order_id: 'LS-TEST-0004',
        purchase_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
    ]

    for (const p of purchases) {
      await svc.from('purchases').upsert(p, { onConflict: 'ls_order_id' })
    }

    // Seed mailing list
    const mailing = [
      { email: TEST_USERS[0].email, confirmed: true, source: 'seed', tags: ['newsletter', 'member'] },
      { email: TEST_USERS[1].email, confirmed: true, source: 'seed', tags: ['newsletter', 'bundle'] },
      { email: TEST_USERS[2].email, confirmed: false, source: 'seed', tags: ['newsletter'] },
    ]

    for (const m of mailing) {
      // Insert if missing
      await svc.from('mailing_list').insert({ email: m.email, confirmed: m.confirmed, source: m.source, tags: m.tags as any }).select('id').single().then(async (res) => {
        if (res.error && !String(res.error.message).includes('duplicate')) {
          // If duplicate or exists, fall through to update
          return
        }
        if (res.error) {
          // try update
          await svc.from('mailing_list').update({ confirmed: m.confirmed, tags: m.tags as any }).eq('email', m.email)
        } else {
          // inserted ok; also ensure state
          await svc.from('mailing_list').update({ confirmed: m.confirmed, tags: m.tags as any }).eq('email', m.email)
        }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Seed error', e)
    return NextResponse.json({ error: 'seed_failed' }, { status: 500 })
  }
}
