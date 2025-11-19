import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieUpdate =
  | { action: "set"; name: string; value: string; options?: Record<string, any> }
  | { action: "remove"; name: string; options?: Record<string, any> };

function normalizeToHttps(u: string): string {
  if (!u) return "";
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") parsed.protocol = "https:";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return u.replace(/^http:\/\//i, "https://");
  }
}

function buildErrorRedirect(message: string, redirect?: string | null) {
  const params = new URLSearchParams({ error: message });
  if (redirect && redirect.startsWith('/')) {
    params.set('redirect', redirect);
  }
  return `/auth/auth-code-error?${params.toString()}`;
}

function resolveRedirectPath(requested?: string | null) {
  if (requested && requested.startsWith("/")) {
    return requested;
  }
  return "/planner";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectParam = url.searchParams.get("redirect");
  console.log('[CB] /auth/callback hit', {
    rid: (req as any).headers?.get?.('x-fz-req-id') || null,
    codePresent: Boolean(code),
    redirectParam,
    referer: (req as any).headers?.get?.('referer') || null,
    ua: (req as any).headers?.get?.('user-agent') || null,
    ip: (req as any).headers?.get?.('x-forwarded-for') || null,
  });

  const cookieStore = await cookies();
  const cookieUpdates: CookieUpdate[] = [];

  const supabaseUrl = normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Callback] Supabase environment variables are missing");
    return NextResponse.redirect(new URL(buildErrorRedirect("invalid_supabase_config"), req.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const v = cookieStore.get(name)?.value;
        if (name.includes('sb')) console.log('[CB] cookies.get', { name, present: Boolean(v) })
        return v;
      },
      set(name: string, value: string, options: any) {
        cookieUpdates.push({ action: "set", name, value, options });
        if (name.includes('sb')) console.log('[CB] cookies.set queued', { name })
      },
      remove(name: string, options: any) {
        cookieUpdates.push({ action: "remove", name, options });
        if (name.includes('sb')) console.log('[CB] cookies.remove queued', { name })
      },
    },
  });

  if (!code) {
    console.error("[Callback] Missing code in auth callback");
    const response = NextResponse.redirect(
      new URL(buildErrorRedirect("missing_code", redirectParam), req.url),
    );
    applyCookieUpdates(response, cookieUpdates);
    return response;
  }

  console.log("[Callback] Exchanging code for session...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  console.log('[CB] exchangeCodeForSession result', {
    ok: !error && Boolean(data?.session),
    error: error?.message || null,
    userId: data?.session?.user?.id,
    expiresAt: data?.session?.expires_at || null,
  })

  if (error || !data?.session) {
    console.error("[Callback] Auth exchange failed:", error);
    const response = NextResponse.redirect(
      new URL(
        buildErrorRedirect(error?.message || "session_exchange_failed", redirectParam),
        req.url,
      ),
    );
    applyCookieUpdates(response, cookieUpdates);
    return response;
  }

  const session = data.session;
  const userId = session.user?.id;
  if (userId) {
    try {
      await supabase.rpc('attach_purchases_to_user', { p_user_id: userId });
      console.log('[CB] attach_purchases_to_user invoked', { userId });
    } catch (e) {
      console.warn('[CB] attach_purchases_to_user failed', String(e));
    }
  }

  let destination = resolveRedirectPath(redirectParam);
  const isPaywallRedirect = destination.startsWith('/membership/paywall');

  // Only override destination to onboarding when not explicitly heading to the paywall
  if (userId && !isPaywallRedirect) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("user_id, home_airport")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.warn("[CB] Profile lookup error:", profileError);
      }

      if (!profile || !profile.home_airport) {
        destination = "/onboarding";
      }
    } catch (profileLookupError) {
      console.warn("[CB] Failed to evaluate onboarding redirect:", profileLookupError);
    }
  }

  // Prepare redirect response now so we can attach cookies to it
  const response = NextResponse.redirect(new URL(destination, req.url));

  // Fallback: explicitly set sb-* cookies so SSR sees session on next request
  try {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').startsWith('http') ? process.env.NEXT_PUBLIC_SITE_URL! : ''
    const host = siteUrl ? new URL(siteUrl).hostname : undefined
    const bareHost = host?.startsWith('www.') ? host.slice(4) : host
    const cookieDomain = (process.env.SUPABASE_COOKIE_DOMAIN || (bareHost ? `.${bareHost}` : undefined)) as string | undefined
    const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname.split('.')[0]
    const accessName = `sb-${ref}-auth-token`
    const refreshName = `sb-${ref}-refresh-token`
    const access = data.session?.access_token || ''
    const refresh = data.session?.refresh_token || ''
    if (access && refresh) {
      response.cookies.set({ name: accessName, value: access, httpOnly: true, secure: true, sameSite: 'lax', path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), maxAge: 60 * 60 } as any)
      response.cookies.set({ name: refreshName, value: refresh, httpOnly: true, secure: true, sameSite: 'lax', path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), maxAge: 60 * 60 * 24 * 365 } as any)
      // also write .4 variants
      response.cookies.set({ name: accessName + '.4', value: access, httpOnly: true, secure: true, sameSite: 'lax', path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), maxAge: 60 * 60 } as any)
      response.cookies.set({ name: refreshName + '.4', value: refresh, httpOnly: true, secure: true, sameSite: 'lax', path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}), maxAge: 60 * 60 * 24 * 365 } as any)
      console.log('[CB] explicitly wrote sb-* cookies', { domain: cookieDomain })
    }
  } catch (e) {
    console.warn('[CB] explicit sb-* cookie write failed', String(e))
  }

  console.log("[CB] Auth session established, redirecting to:", destination);
  applyCookieUpdates(response, cookieUpdates);
  try {
    console.log('[CB] Applied cookie updates', cookieUpdates.map(u => ({ action: u.action, name: u.name })));
  } catch {}
  return response;
}

function applyCookieUpdates(response: NextResponse, updates: CookieUpdate[]) {
  for (const update of updates) {
    if (update.action === "set") {
      response.cookies.set({
        name: update.name,
        value: update.value,
        ...(update.options ?? {}),
      });
    } else {
      response.cookies.set({
        name: update.name,
        value: "",
        ...(update.options ?? {}),
        maxAge: 0,
      });
    }
  }
}
