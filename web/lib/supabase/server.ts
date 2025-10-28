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
            // Server Components expose a read-only cookie store; ignore write attempts there.
          }
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch (e) {
              // See note above re: read-only cookie store.
            }
          })
        },
        remove(name: string, options: any) {
          try {
            if (options?.path) {
              // next/headers cookies() does not currently support scoped deletes; fall back to default delete.
            }
            cookieStore.delete(name)
          } catch (e) {
            // Ignore delete attempts when cookie store is read-only.
          }
        },
      },
    }
  )
}