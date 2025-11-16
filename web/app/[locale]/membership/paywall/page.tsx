'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { POST_MEMBERSHIP_ONBOARDING_PATH } from '@/lib/auth/magicLink'

export default function PaywallPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('Paywall')
  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4')]
  const supabase = useMemo(() => createClient(), [])

  const redirectTarget = useMemo(() => {
    const raw = searchParams.get('redirect')
    if (raw && raw.startsWith('/')) {
      return raw
    }
    return POST_MEMBERSHIP_ONBOARDING_PATH
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    async function ensureMemberStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!isMounted || !user?.id) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_member')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile?.is_member) {
        router.replace(redirectTarget)
      }
    }

    ensureMemberStatus()

    return () => {
      isMounted = false
    }
  }, [redirectTarget, router, supabase])

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect: redirectTarget }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      router.push(url)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
      // TODO: Show an error message to the user
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-4 border-b border-gray-200 p-8 text-center dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t('description')}</p>
        </div>
        <div className="space-y-6 p-8">
          <div className="text-center">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">$29</span>
            <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">/ one-time payment</span>
          </div>
          <ul className="space-y-3 text-left text-sm text-gray-700 dark:text-gray-200">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-gray-200 p-8 dark:border-gray-800">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? t('loading') : t('cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
