import { createClient } from '@supabase/supabase-js';

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

const url = normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

let supabaseServer: any
let createServerClient: any

if (!serviceKey) {
  // It's okay in dev, but admin routes will fail without a service role key.
  // Avoid constructing a Supabase client with an empty key because the
  // library will throw during module initialization which breaks builds.
  console.warn('No SUPABASE_SERVICE_ROLE_KEY set - server admin routes will be disabled');

  // Lightweight stub that throws when methods are invoked. This defers
  // the error to runtime when the admin route actually tries to use it.
  const throwing = new Proxy(
    {},
    {
      get() {
        return () => {
          throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in the environment; server admin routes are disabled');
        };
      },
    }
  ) as any;

  supabaseServer = throwing
  createServerClient = () => {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in the environment; createServerClient() is disabled')
  }
} else {
  supabaseServer = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  // Export a function to create a new client instance
  createServerClient = () =>
    createClient(url, serviceKey, {
      auth: { persistSession: false },
    })
}

// Backwards-compatible helper used by older routes. Prefer createServerClient()
// when you need a fresh instance.
export function getSupabaseServerClient() {
  return createServerClient()
}

export { supabaseServer, createServerClient }
