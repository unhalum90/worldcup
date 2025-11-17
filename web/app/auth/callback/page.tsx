"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        // Attempt to parse any session info from the URL (magic link / OAuth flows)
        // This stores the session in browser storage and triggers onAuthStateChange
        const { data, error } = await supabase.auth.getSessionFromUrl()
        if (error) {
          console.error('[AuthCallback] getSessionFromUrl error', error)
          if (mounted) setMessage('Sign-in failed. Redirecting...')
        } else {
          console.log('[AuthCallback] session parsed from URL', data?.session?.user?.email)
          // Sync session to server so SSR sees the cookies
          try {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ event: 'SIGNED_IN', session: data?.session ?? null }),
            })
          } catch (e) {
            console.warn('[AuthCallback] failed to sync session to server', e)
          }
        }
      } catch (e) {
        console.error('[AuthCallback] unexpected error', e)
        if (mounted) setMessage('Sign-in error. Redirecting...')
      } finally {
        // Respect redirect query param set before magic link was sent
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/account'
        // Small delay to let client state settle
        setTimeout(() => {
          try { router.replace(redirect) } catch { window.location.href = redirect }
        }, 250)
      }
    }
    run()
    return () => { mounted = false }
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  )
}
