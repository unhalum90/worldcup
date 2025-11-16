// Unify browser Supabase client usage to a single instance to avoid
// "Multiple GoTrueClient instances" and token races.
// Always reuse the singleton exported by lib/supabaseClient.ts
// which is created via @supabase/ssr's createBrowserClient.

import { supabase as browserSupabase } from '@/lib/supabaseClient'

export function createClient() {
  return browserSupabase
}
