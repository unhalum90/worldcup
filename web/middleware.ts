import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { SerializeOptions } from 'cookie'

type CookieOptions = Partial<SerializeOptions>

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const reqId = (globalThis as any).crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-fz-req-id', reqId)

  // NOTE: Do not force host rewrites here. Vercel domain settings may
  // redirect apex<->www and cause loops if we alter host at the edge.

  // Define protected routes (keep planner hub public; guard tool pages)
  const protectedRoutes = ['/planner/trip-builder', '/flight-planner', '/lodging-planner', '/onboarding']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const ua = request.headers.get('user-agent') || 'unknown';
      const cookieNames = request.cookies.getAll().map(c => c.name);
      console.log('[MW] Incoming request', {
        rid: reqId,
        path: pathname,
        protected: true,
        ip,
        ua: ua.slice(0, 80),
        cookieNames,
      });
    } catch (e) {
      console.log('[MW] Failed to introspect request headers/cookies', { rid: reqId, error: String(e) });
    }
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('[MW] Auth getUser() result', {
      rid: reqId,
      hasUser: Boolean(user),
      userId: user?.id,
      email: user?.email,
    })

    if (!user) {
      // Redirect to sign-in page if not authenticated
      console.log('[MW] No user, redirecting to /login', { rid: reqId, path: pathname })
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.headers.set('x-fz-req-id', reqId)
      return res
    }

    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('is_member')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('[MW] Profile membership check', {
        rid: reqId,
        userId: user.id,
        profile, profileErr,
      })

      if (!profile?.is_member) {
        console.log('[MW] Not a member, redirecting to paywall', { rid: reqId, userId: user.id, path: pathname })
        const res = NextResponse.redirect(new URL('/membership/paywall', request.url))
        res.headers.set('x-fz-req-id', reqId)
        return res
      }
    } catch (e) {
      // Fail-closed to paywall on unexpected errors
      console.log('[MW] Exception during profile check, redirecting to paywall', { rid: reqId, error: String(e) })
      const res = NextResponse.redirect(new URL('/membership/paywall', request.url))
      res.headers.set('x-fz-req-id', reqId)
      return res
    }
  }

  console.log('[MW] Allowing request to continue', { rid: reqId, path: pathname })
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-fz-req-id', reqId)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
//added
