import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const cookieStore = await cookies()
    const res = new NextResponse(null, { status: 200 })
    const supabase = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            res.cookies.delete({ name, ...options })
          },
        },
      }
    )

    // When signing in, refresh, or updating user, set the session cookies on the server
    if (body?.event === 'SIGNED_IN' || body?.event === 'TOKEN_REFRESHED' || body?.event === 'USER_UPDATED') {
      if (body?.session?.access_token && body?.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: body.session.access_token,
          refresh_token: body.session.refresh_token,
        })
      }

      // Best-effort: attach any pre-login purchases to this user by email
      try {
        const userId = body?.session?.user?.id
        if (userId) {
          await supabase.rpc('attach_purchases_to_user', { p_user_id: userId })
        }
      } catch {
        // ignore if function missing or fails; this is a soft helper
      }
    }

    // When signing out, clear cookies
    if (body?.event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    }

    return res
  } catch (e) {
    return new NextResponse('Bad Request', { status: 400 })
  }
}
