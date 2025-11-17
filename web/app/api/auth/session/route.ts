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
    
    // Resolve cookie domain to cover apex + subdomains
    const siteUrl = normalizeToHttps(process.env.NEXT_PUBLIC_SITE_URL || '')
    const host = siteUrl ? new URL(siteUrl).hostname : undefined
    const bareHost = host?.startsWith('www.') ? host.slice(4) : host
    const cookieDomain = (process.env.SUPABASE_COOKIE_DOMAIN || (bareHost ? `.${bareHost}` : undefined)) as string | undefined
    
    function setHttpOnlyCookie(name: string, value: string, opts?: { maxAge?: number }) {
      try {
        res.cookies.set({
          name,
          value,
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          ...(cookieDomain ? { domain: cookieDomain } : {}),
          ...(opts?.maxAge ? { maxAge: opts.maxAge } : {}),
        } as any)
        console.log('[AUTH/SESSION] set cookie', { name, domain: cookieDomain })
      } catch (e) {
        console.warn('[AUTH/SESSION] failed set cookie', { name, error: String(e) })
      }
    }
    function clearHttpOnlyCookie(name: string) {
      try {
        res.cookies.set({ name, value: '', maxAge: 0, path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}) } as any)
        console.log('[AUTH/SESSION] clear cookie', { name, domain: cookieDomain })
      } catch (e) {
        console.warn('[AUTH/SESSION] failed clear cookie', { name, error: String(e) })
      }
    }
    const supabase = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Ensure cookies written by SDK also get our domain/path attributes
            res.cookies.set({ name, value, path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), ...options } as any)
          },
          remove(name: string, options: any) {
            res.cookies.set({ name, value: '', maxAge: 0, path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), ...options } as any)
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

        // Additionally set the standard sb-* cookies explicitly to ensure
        // SSR/middleware sees them on the very next request.
        try {
          const ref = new URL(normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || '')).hostname.split('.')[0]
          const accessName = `sb-${ref}-auth-token`
          const refreshName = `sb-${ref}-refresh-token`
          // Write base names
          setHttpOnlyCookie(accessName, body.session.access_token, { maxAge: 60 * 60 })
          setHttpOnlyCookie(refreshName, body.session.refresh_token, { maxAge: 60 * 60 * 24 * 365 })
          // Also write the dot-suffixed variant some SDK versions query (e.g., .4)
          setHttpOnlyCookie(accessName + '.4', body.session.access_token, { maxAge: 60 * 60 })
          setHttpOnlyCookie(refreshName + '.4', body.session.refresh_token, { maxAge: 60 * 60 * 24 * 365 })
        } catch (e) {
          console.warn('[AUTH/SESSION] explicit cookie set failed', String(e))
        }
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
      // Proactively clear sb-* cookies we may have written
      try {
        const ref = new URL(normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || '')).hostname.split('.')[0]
        clearHttpOnlyCookie(`sb-${ref}-auth-token`)
        clearHttpOnlyCookie(`sb-${ref}-refresh-token`)
        clearHttpOnlyCookie(`sb-${ref}-auth-token.4`)
        clearHttpOnlyCookie(`sb-${ref}-refresh-token.4`)
      } catch {}
    }

    return res
  } catch (e) {
    return new NextResponse('Bad Request', { status: 400 })
  }
}
