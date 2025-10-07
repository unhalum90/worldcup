import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

if (!serviceKey) {
  // It's okay in dev, but admin routes will fail without a service role key
  console.warn('No SUPABASE_SERVICE_ROLE_KEY set - server admin routes will be disabled');
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
