import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { SerializeOptions } from 'cookie'

type CookieOptions = Partial<SerializeOptions>

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Canonical host: ensure cookies originate from apex domain
  const host = request.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const url = new URL(request.url)
    url.host = host.replace(/^www\./, '')
    return NextResponse.redirect(url)
  }

  // Define protected routes (keep planner hub public; guard tool pages)
  const protectedRoutes = ['/planner/trip-builder', '/flight-planner', '/lodging-planner', '/onboarding']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
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

    if (!user) {
      // Redirect to sign-in page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_member')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile?.is_member) {
        return NextResponse.redirect(new URL('/membership/paywall', request.url))
      }
    } catch (e) {
      // Fail-closed to paywall on unexpected errors
      return NextResponse.redirect(new URL('/membership/paywall', request.url))
    }
  }

  return NextResponse.next()
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
