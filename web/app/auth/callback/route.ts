import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function buildErrorRedirect(message: string) {
  const params = new URLSearchParams({ error: message });
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

  if (!code) {
    console.error("[Callback] Missing code in auth callback");
    return redirect(buildErrorRedirect("missing_code"));
  }

  const supabase = createRouteHandlerClient({ cookies });

  console.log("[Callback] Exchanging code for session...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("[Callback] Auth exchange failed:", error);
    return redirect(buildErrorRedirect(error?.message || "session_exchange_failed"));
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
  redirect(destination);
}
