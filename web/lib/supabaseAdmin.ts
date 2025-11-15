// web/lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Utility function to ensure HTTPS protocol
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

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Get Supabase client initialized with the Service Role Key.
 * This client bypasses Row-Level Security (RLS) for server-to-server operations.
 * USE ONLY IN SERVER COMPONENTS, API ROUTES, OR ROUTE HANDLERS.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!)
  // Try SUPABASE_SERVICE_ROLE_KEY first (standard name), fall back to SUPABASE_SECRET_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is not set. This is required for admin operations. ' +
      'Add it to your .env.local file.'
    );
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdminInstance;
}

// For backward compatibility, export a getter
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  }
});

