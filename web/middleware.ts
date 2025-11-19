import { NextResponse, NextRequest } from 'next/server';
import { defaultLocale } from './i18n';
import { createServerClient } from '@supabase/ssr';
import { isActiveMember } from './lib/membership';

function normalizeToHttps(u: string): string {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return u.replace(/^http:\/\//i, 'https://');
  }
}

// Middleware to handle locale from cookies
export async function middleware(req: NextRequest) {
  // Get locale from cookie
  const locale = req.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
  
  // Clone the request headers
  const requestHeaders = new Headers(req.headers);
  
  // Set the locale header so next-intl can pick it up
  requestHeaders.set('x-next-intl-locale', locale);

  // Prepare response so we can set cookies (for Supabase session refresh)
  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Ensure anonymous voter cookie for tournament flows (no-login voting UX)
  try {
    const isTournament = req.nextUrl.pathname.startsWith('/tournament');
    const existing = req.cookies.get('t_voter')?.value;
    if (isTournament && !existing) {
      const anonId = crypto.randomUUID();
      res.cookies.set({
        name: 't_voter',
        value: anonId,
        httpOnly: false, // readable client-side for optimistic UI if needed
        sameSite: 'lax',
        secure: req.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 5, // ~5 years
      });
    }
  } catch {}

  // Supabase client bound to request/response cookies
  let user: any = null;
  let supabase: any = null;
  try {
    supabase = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              res.cookies.set({ name, value, ...options });
            } catch (e) {
              console.warn('⚠️ Failed to set cookie in middleware', e);
            }
          },
          remove(name: string, options: any) {
            try {
              res.cookies.delete({ name, ...options });
            } catch (e) {
              console.warn('⚠️ Failed to delete cookie in middleware', e);
            }
          },
        },
      }
    );

    // ✅ Retrieve session (includes user and auto-refreshes)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user = session?.user ?? null;

    console.log('[Middleware] supabase.auth.getSession()', {
      hasSession: !!session,
      id: session?.user?.id,
      email: session?.user?.email,
    });
  } catch {
    // ignore refresh errors in middleware; page-level code can still handle
  }

  const pathname = req.nextUrl.pathname;
  // Allow either server-only ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS (fallback)
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  // 🚧 Bypass middleware during Supabase auth callback or immediate post-login refresh
  if (pathname.startsWith('/auth/callback')) {
    return res;
  }

  // Allow through if Supabase is mid-refresh (avoid redirect loop)
  const hasAuthCookie = !!req.cookies.get('sb-access-token');
  if (!user && hasAuthCookie) {
    return res;
  }

  // Premium gating — allow runtime configuration via CSV env var
  // Premium gating — only active when NEXT_PUBLIC_ENABLE_PAYWALL is 'true'
  const paywallEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYWALL === 'true';
  if (paywallEnabled) {
    const envPrefixes = (process.env.NEXT_PUBLIC_PAYWALLED_PREFIXES || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    // Sensible defaults if none provided
    const paywalledPrefixes = envPrefixes.length > 0
      ? envPrefixes
      : ['/planner/trip-builder', '/flight-planner', '/lodging-planner'];
    const isPaywalled = paywalledPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (isPaywalled) {
      const redirectUrl = new URL('/memberships', req.url);
      redirectUrl.searchParams.set('from', 'planner');
      redirectUrl.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));

      // If no user, send to memberships page (public checkout) instead of login
      if (!user) {
        return NextResponse.redirect(redirectUrl);
      }

      // If user exists but not an active member, redirect to waiting page
      try {
        const active = await isActiveMember(supabase, user.id);
        if (!active) {
          const waitingUrl = new URL('/waiting', req.url);
          waitingUrl.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
          return NextResponse.redirect(waitingUrl);
        }
      } catch {
        // If membership check fails, be conservative and redirect
        const waitingUrl = new URL('/waiting', req.url);
        waitingUrl.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
        return NextResponse.redirect(waitingUrl);
      }
    }
  }

  if (pathname.startsWith('/admin')) {
    // Allow public admin auth pages to render without being redirected
    const publicAdminPages = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
    if (publicAdminPages.some((p) => pathname === p || pathname.startsWith(p))) {
      return res;
    }
    const email = typeof user?.email === 'string' ? user.email.toLowerCase() : null;
    if (!email || (adminEmails.length > 0 && !adminEmails.includes(email))) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Optional onboarding gate (disabled by default). When enabled, if a user is authenticated
  // but has not completed onboarding/profile, gently route them to onboarding and then back.
  const gateEnabled = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING_GATE === 'true';
  if (gateEnabled && user?.id && supabase) {
    const cookieOnboarded = req.cookies.get('wc26-onboarded')?.value === 'true';
    const inOnboarding = pathname.startsWith('/onboarding');
    const isLogin = pathname.startsWith('/login');
    const isApi = pathname.startsWith('/api');
    const isStaticAsset = pathname.includes('.');
    
    // Skip onboarding redirect for API routes, static assets, login, and onboarding itself
    if (!cookieOnboarded && !inOnboarding && !isLogin && !isApi && !isStaticAsset) {
      try {
        // Check if user has completed profile - if not, redirect to onboarding
        const { data: prof } = await supabase
          .from('user_profile')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!prof) {
          // Check if they're an active member to determine onboarding source
          const active = await isActiveMember(supabase, user.id);
          const url = new URL('/onboarding', req.url);
          url.searchParams.set('from', active ? 'membership' : 'signup');
          url.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
          return NextResponse.redirect(url);
        }
      } catch {
        // If profile table missing, do nothing.
      }
    }
  }

  console.log(
    '[Middleware]',
    JSON.stringify({
      path: req.nextUrl.pathname,
      hasAuthCookie: !!req.cookies.get('sb-access-token'),
      user: user ? user.email || user.id : null,
      cookies: req.cookies.getAll().map(c => c.name),
    })
  );

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
