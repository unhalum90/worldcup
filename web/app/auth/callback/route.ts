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
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieUpdates.push({ action: "set", name, value, options });
      },
      remove(name: string, options: any) {
        cookieUpdates.push({ action: "remove", name, options });
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
        console.warn("[Callback] Profile lookup error:", profileError);
      }

      if (!profile || !profile.home_airport) {
        destination = "/onboarding";
      }
    } catch (profileLookupError) {
      console.warn("[Callback] Failed to evaluate onboarding redirect:", profileLookupError);
    }
  }

  console.log("[Callback] Auth session established, redirecting to:", destination);
  const response = NextResponse.redirect(new URL(destination, req.url));
  applyCookieUpdates(response, cookieUpdates);
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
