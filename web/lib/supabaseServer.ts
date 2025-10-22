import { createClient } from '@supabase/supabase-js';

// Ensure URL always uses HTTPS
let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (url && url.startsWith('http://')) {
  console.warn('⚠️ Supabase URL was http://, converting to https://');
  url = url.replace('http://', 'https://');
}

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

if (!serviceKey) {
  // It's okay in dev, but admin routes will fail without a service role key
  console.warn('No SUPABASE_SERVICE_ROLE_KEY set - server admin routes will be disabled');
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Export a function to create a new client instance
export function createServerClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
