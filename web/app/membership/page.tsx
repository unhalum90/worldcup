'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MembershipPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login
        router.push('/login?redirect=/membership')
        return
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      // Redirect to Lemon Squeezy
      window.location.href = url

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          World Cup 2026 Trip Builder
        </h1>
        <p className="text-xl text-gray-600">
          Plan your perfect World Cup experience with AI-powered trip planning
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="mb-6">
          <div className="text-5xl font-bold mb-2">$29</div>
          <div className="text-gray-600">One-time payment • Lifetime access</div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Complete city guides for all 16 host cities</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI-powered personalized trip planning</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Flight and lodging recommendations</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Match day planning tools (available June 2026)</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Access Now'}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Secure checkout powered by Lemon Squeezy</p>
        <p className="mt-2">Questions? Email support@worldcup26fanzone.com</p>
      </div>
    </div>
  )
}
