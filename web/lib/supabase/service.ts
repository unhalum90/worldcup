import { createServerClient } from '@supabase/ssr'

function normalizeToHttps(u: string): string {
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:'
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return u.replace(/^http:\/\//i, 'https://')
  }
}

export async function createServiceClient() {
  const url = normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE service configuration')
  }
  // Service client does not need cookie bindings
  return createServerClient(url, serviceKey, {
    cookies: {
      get() {
        return undefined as any
      },
      getAll() {
        return [] as any
      },
      set() {},
      setAll() {},
      remove() {},
    },
  })
}

