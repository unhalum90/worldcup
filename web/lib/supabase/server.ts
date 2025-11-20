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

// Canonical server-side Supabase client for routes/layouts that need the anon key
// and cookie-bound sessions (SSR safe).
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
          } catch {
            // Read-only in some RSC contexts; safe to ignore.
          }
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Read-only in some RSC contexts; safe to ignore.
            }
          })
        },
        remove(name: string, options: any) {
          try {
            if (options?.path) {
              // Scoped deletes not fully supported; fall back to default.
            }
            cookieStore.delete(name)
          } catch {
            // Read-only in some RSC contexts; safe to ignore.
          }
        },
      },
    }
  )
}
