import { cookies } from "next/headers";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cookie-aware Supabase client for authenticated user requests
 * (used in layouts, server components, and API routes that need the logged-in user)
 */
export function createServerClientInstance() {
  const cookieStore = cookies() as any;

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Ignore errors during RSC set-cookie attempts
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete(name, options);
        } catch {
          // Ignore
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
