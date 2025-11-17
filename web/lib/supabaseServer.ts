import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cookie‑aware Supabase client for authenticated user requests
 */
export async function createServerClientInstance() {
  // Resolve cookie store (handles runtimes where cookies() is async)
  const cookieStore = (await cookies()) as any;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          // Ensure path is set for consistency
          cookieStore.set({ name, value, ...(options ?? {}), path: '/' });
        } catch {
          /* ignore read-only cookie errors */
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', maxAge: 0, ...(options ?? {}), path: '/' });
        } catch {
          /* ignore */
        }
      },
    },
  });
}

/**
 * Backward‑compatible alias for older imports
 */
export const getSupabaseServerClient = createServerClientInstance;

/**
 * Admin-only Supabase client (service role key)
 * Never exposed to the client.
 */
export const supabaseServer = serviceRoleKey
  ? createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
  : null;
