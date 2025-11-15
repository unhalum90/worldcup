import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        getAll() {
          return cookieStore.getAll()
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (e) {
            // read-only cookie store in some server contexts
          }
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch (e) {
              // ignore when read-only
            }
          })
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch (e) {
            // ignore when read-only
          }
        },
      },
    }
  )
}

// Admin client for bypassing RLS
export function createAdminClient() {
  return createServerClient(
    normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined
        },
        getAll() {
          return []
        },
        set() {},
        setAll() {},
        remove() {},
      },
    }
  )
}