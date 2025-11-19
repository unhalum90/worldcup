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

export async function GET(_req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {
            // Read-only in this handler; no-op
          },
          remove() {
            // Read-only in this handler; no-op
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    return NextResponse.json({
      user: session?.user ?? null,
    })
  } catch (e) {
    console.error('GET /api/auth/session failed', e)
    return new NextResponse(JSON.stringify({ user: null, error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
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
