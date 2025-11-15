import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { supabaseServer } from '@/lib/supabaseServer'

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

async function ensureAdmin(req: NextRequest) {
  const supabase = createSSRClient(
    normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { get: (n: string) => req.cookies.get(n)?.value, set() {}, remove() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Allow via env list
  const allow = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  if (allow.length > 0 && !allow.includes((user.email || '').toLowerCase())) return null

  try {
    const { data: prof } = await supabaseServer.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
    if (allow.length === 0 && (!prof || (prof.role !== 'admin' && prof.role !== 'superadmin' && prof.role !== 'moderator'))) return null
  } catch {}

  return user
}

export async function GET(req: NextRequest) {
  const user = await ensureAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25))

  // Collect auth users via Admin API
  let authUsers: any[] = []
  let total = 0

  try {
    if (q) {
      // 1) Try to resolve by profile email -> user_id
      let targetId: string | null = null
      try {
        const { data: prof } = await supabaseServer
          .from('profiles')
          .select('user_id')
          .ilike('email', q)
          .maybeSingle()
        if (prof?.user_id) targetId = prof.user_id
      } catch {}

      if (targetId) {
        const byId = await supabaseServer.auth.admin.getUserById(targetId)
        if (byId?.data?.user) {
          authUsers = [byId.data.user]
          total = 1
        }
      }

      // 2) If not found via profiles, scan a page of auth users and filter email
      if (authUsers.length === 0) {
        const { data, error } = await supabaseServer.auth.admin.listUsers({ page: 1, perPage: Math.max(limit, 200) })
        if (error) throw error
        const list = data.users || []
        const found = list.find((u: any) => (u.email || '').toLowerCase() === q.toLowerCase())
        if (found) {
          authUsers = [found]
          total = 1
        } else {
          // fallback to first page if still nothing
          authUsers = list
          total = data.total || list.length
        }
      }
    } else {
      const { data, error } = await supabaseServer.auth.admin.listUsers({ page, perPage: limit })
      if (error) throw error
      authUsers = data.users || []
      total = data.total || authUsers.length
    }
  } catch (e) {
    return NextResponse.json({ error: 'auth_list_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }

  const ids = authUsers.map((u) => u.id)

  // Load profiles
  let profiles: Record<string, any> = {}
  if (ids.length) {
    const { data: profRows } = await supabaseServer
      .from('profiles')
      .select('user_id, email, name, handle, role, account_level, subscription_tier, subscription_status, is_member, updated_at')
      .in('user_id', ids)
    if (Array.isArray(profRows)) {
      for (const p of profRows) profiles[p.user_id] = p
    }
  }

  // Purchases summary (client-side aggregate)
  let purchasesMap: Record<string, number> = {}
  if (ids.length) {
    const { data: pRows } = await supabaseServer
      .from('purchases')
      .select('user_id')
      .in('user_id', ids)
    if (Array.isArray(pRows)) {
      for (const r of pRows as any[]) {
        const uid = r.user_id as string
        purchasesMap[uid] = (purchasesMap[uid] || 0) + 1
      }
    }
  }

  const users = authUsers.map((au) => ({
    auth: {
      id: au.id,
      email: au.email,
      created_at: au.created_at || au.createdAt || null,
      last_sign_in_at: au.last_sign_in_at || au.lastSignInAt || null,
      email_confirmed_at: au.email_confirmed_at || au.emailConfirmedAt || null,
    },
    profile: profiles[au.id] || null,
    purchases: purchasesMap[au.id] || 0,
  }))

  return NextResponse.json({ users, page, perPage: limit, total })
}
