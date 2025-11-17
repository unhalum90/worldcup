import { cookies, headers as nextHeaders } from "next/headers";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cookie-aware Supabase client for authenticated user requests
 * (used in layouts, server components, and API routes that need the logged-in user)
 */
function tryGetRidSync(): string | null {
  try {
    const nh: any = nextHeaders as any;
    const h = nh && nh();
    if (h && typeof h.get === 'function') return h.get('x-fz-req-id');
  } catch {}
  return null;
}

export function createServerClientInstance() {
  const cookieStore = cookies() as any;
  try {
    const names = cookieStore?.getAll ? cookieStore.getAll().map((c: any) => c.name) : [];
    const rid = tryGetRidSync();
    console.log('[SSR] createServerClientInstance()', { rid, cookieNames: names });
  } catch (e) {
    const rid = tryGetRidSync();
    console.log('[SSR] createServerClientInstance() cookie introspection failed', { rid, error: String(e) });
  }

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const val = cookieStore.get(name)?.value;
        if (name.includes('sb')) console.log('[SSR] cookies.get', { rid: tryGetRidSync(), name, present: Boolean(val) });
        return val;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options);
          if (name.includes('sb')) console.log('[SSR] cookies.set', { rid: tryGetRidSync(), name });
        } catch {
          // Ignore errors during RSC set-cookie attempts
          console.log('[SSR] cookies.set failed (read-only store?)', { rid: tryGetRidSync(), name });
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete(name, options);
          if (name.includes('sb')) console.log('[SSR] cookies.remove', { rid: tryGetRidSync(), name });
        } catch {
          // Ignore
          console.log('[SSR] cookies.remove failed (read-only store?)', { rid: tryGetRidSync(), name });
        }
      },
    },
  });
}

/**
 * Backwards‑compatible export for API routes expecting createServerClient()
 */
export function createServerClient() {
  return createServerClientInstance();
}

/**
 * Admin client using the service role key — ONLY for trusted server API routes
 * (e.g. webhooks, admin dashboards). Never use this on the client.
 */
export const supabaseServer = serviceRoleKey
  ? createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

if (supabaseServer) {
  console.log('[SSR] Service role client initialized');
} else {
  console.log('[SSR] Service role client NOT initialized (no SUPABASE_SERVICE_ROLE_KEY)');
}
