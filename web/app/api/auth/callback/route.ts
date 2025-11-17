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
    // No `code` present — this can be the case for magic-link flows which return
    // tokens in the URL fragment (after `#`). Fragments are not sent to the
    // server, so respond with 204 to indicate nothing to do. The client-side
    // page at /auth/callback will parse fragments and sync the session.
    console.log('[Callback API] No code present — nothing to exchange on server');
    return new NextResponse(null, { status: 204 });
  }

  console.log("[Callback API] Exchanging code for session...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("[Callback API] Auth exchange failed:", error);
    return NextResponse.redirect(
      new URL(
        buildErrorRedirect(error?.message || "session_exchange_failed", redirectParam),
        req.url,
      ),
    );
  }

  const session = data.session;
  const userId = session.user?.id;
  let destination = resolveRedirectPath(redirectParam);

  if (userId) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("user_id, home_airport")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.warn("[Callback API] Profile lookup error:", profileError);
      }

      if (!profile || !profile.home_airport) {
        destination = "/onboarding";
      }
    } catch (profileLookupError) {
      console.warn("[Callback API] Failed to evaluate onboarding redirect:", profileLookupError);
    }
  }

  console.log("[Callback API] Auth session established, redirecting to:", destination);
  // Set any cookies accumulated during the server-client exchange
  const response = NextResponse.redirect(new URL(destination, req.url));
  for (const update of cookieUpdates) {
    if (update.action === "set") {
      response.cookies.set({ name: update.name, value: update.value, ...(update.options ?? {}) });
    } else {
      response.cookies.set({ name: update.name, value: "", ...(update.options ?? {}), maxAge: 0 });
    }
  }
  return response;
}
