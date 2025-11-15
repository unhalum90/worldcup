import { NextResponse, NextRequest } from 'next/server';
import { defaultLocale } from './i18n';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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
  // 🚨 Bypass for Lemon Squeezy webhook (must not be intercepted by middleware)
  if (req.nextUrl.pathname.startsWith('/api/webhooks/lemon')) {
    return NextResponse.next();
  }
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

  // Supabase client bound to request/response cookies
  let user: any = null;
  let supabase: any = null;
  try {
    // Use the SSR server client with manual cookie adapter for middleware
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
  // Check for Supabase auth token with the correct project-specific cookie name
  const allCookies = req.cookies.getAll();
  const hasAuthCookie = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );
  if (!user && hasAuthCookie) {
    console.log('[Middleware] Auth cookie present but no session yet - allowing through');
    return res;
  }

  // Premium gating — allow runtime configuration via CSV env var
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

    // If user exists but not an active member, redirect to memberships
    try {
      // Use service role client to bypass RLS when checking membership
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
      const adminSupabase = serviceKey
        ? createClient(
            normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
            serviceKey,
            { auth: { persistSession: false } }
          )
        : supabase; // Fallback to SSR client if no service key (dev mode)
      
      const active = await isActiveMember(adminSupabase, user.id);
      if (!active) {
        // Add a tiny hint for diagnostics without leaking details
        redirectUrl.searchParams.set('gate', 'not_member');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      // Log the error for debugging
      console.error('[Middleware] Membership check error:', err);
      // If membership check fails (e.g., transient auth cookies), allow and let API enforce
      // Trip Builder API routes also gate using server-side checks.
      return res;
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
          // Use service role client for membership check
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
          const adminSupabase = serviceKey
            ? createClient(
                normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
                serviceKey,
                { auth: { persistSession: false } }
              )
            : supabase;
          
          const active = await isActiveMember(adminSupabase, user.id);
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
      hasAuthCookie: hasAuthCookie,
      hasSession: !!user,
      user: user ? user.email || user.id : null,
      cookies: req.cookies.getAll().map(c => c.name),
    })
  );

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

//added
