import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_ROUTES = [
  '/planner/trip-builder',
  '/planner/lodging',
  '/planner/flights',
]

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  
  if (!isProtected) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  const supabase = createServerClient(
    normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[Middleware] user check', {
    path: pathname,
    hasUser: !!user,
    userError: userError?.message,
    cookieNames: request.cookies.getAll().map(c => c.name),
  })

  if (!user) {
    const redirectUrl = new URL('/membership', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check membership
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_member')
    .eq('user_id', user.id)
    .single()

  console.log('[Middleware] membership check', {
    path: pathname,
    isMember: profile?.is_member,
    profileError: profileError?.message,
  })

  if (!profile?.is_member) {
    const redirectUrl = new URL('/membership', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
