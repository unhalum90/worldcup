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
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            res.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    // ignore refresh errors in middleware; page-level code can still handle
  }

  // Premium gating: require auth for planner routes
  const pathname = req.nextUrl.pathname;
  const requiresAuth = pathname.startsWith('/planner');
  if (requiresAuth && !user) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  // Optional onboarding gate (disabled by default). When enabled, if a user is authenticated
  // but has not completed onboarding/profile, gently route them to onboarding and then back.
  const gateEnabled = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING_GATE === 'true';
  if (gateEnabled && user && supabase) {
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

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
