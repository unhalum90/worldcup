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
  const allow = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  if (allow.length > 0 && !allow.includes((user.email || '').toLowerCase())) return null
  try {
    const { data: prof } = await supabaseServer.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
    if (allow.length === 0 && (!prof || (prof.role !== 'admin' && prof.role !== 'superadmin' && prof.role !== 'moderator'))) return null
  } catch {}
  return user
}

export async function POST(req: NextRequest) {
  const user = await ensureAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const targetId: string | undefined = body?.user_id
  const patch: any = body?.profile || {}
  if (!targetId || typeof patch !== 'object') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Only allow safe profile fields to be updated
  const allowed = ['role','is_member','account_level','subscription_tier','subscription_status','name','handle']
  const update: Record<string, any> = {}
  for (const key of allowed) {
    if (key in patch) update[key] = patch[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 })
  }

  try {
    // Upsert to guarantee a row exists for this user_id
    const { error } = await supabaseServer
      .from('profiles')
      .upsert({ user_id: targetId, ...update, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw error
  } catch (e) {
    return NextResponse.json({ error: 'update_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
