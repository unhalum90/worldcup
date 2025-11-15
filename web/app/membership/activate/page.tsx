'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ActivatePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Auto-activate if coming from checkout
    const orderId = searchParams.get('order_id')
    if (orderId) {
      autoActivate()
    }
  }, [searchParams])

  const autoActivate = async () => {
    setLoading(true)
    setMessage('Verifying your purchase...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setMessage('Please log in to activate your membership')
        setLoading(false)
        return
      }

      await activateMembership(user.email)

    } catch (error) {
      console.error('Auto-activation error:', error)
      setMessage('Error activating membership. Please try manually below.')
      setLoading(false)
    }
  }

  const activateMembership = async (emailToUse: string) => {
    setLoading(true)
    setMessage('Checking for purchases...')

    try {
      const response = await fetch('/api/membership/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Membership activated! Redirecting...')
        
        // Refresh session
        const supabase = createClient()
        await supabase.auth.refreshSession()

        // Redirect to planner
        setTimeout(() => {
          router.push('/planner/trip-builder')
        }, 2000)
      } else {
        setMessage(result.message || 'No purchase found for this email')
        setLoading(false)
      }

    } catch (error) {
      console.error('Activation error:', error)
      setMessage('Error activating membership. Please contact support.')
      setLoading(false)
    }
  }

  const handleManualActivation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await activateMembership(email)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Activate Your Membership
        </h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && !message.includes('✅') && (
          <>
            <p className="text-gray-600 mb-6 text-center">
              If you just completed your purchase, we'll activate your membership automatically.
              If not, enter the email you used at checkout below.
            </p>

            <form onSubmit={handleManualActivation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Checkout Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Activate Membership
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/membership" className="text-blue-600 hover:underline">
                ← Back to membership page
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
