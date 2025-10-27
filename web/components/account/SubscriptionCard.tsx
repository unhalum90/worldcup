"use client"

import { useState } from 'react'

export default function SubscriptionCard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePortal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/account/portal', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.open(data.url, '_blank')
      } else {
        setError('Portal is currently unavailable')
      }
    } catch (e) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Manage your active subscription, invoices, and payment methods.</p>
      <button
        onClick={handlePortal}
        disabled={loading}
        className="inline-flex items-center rounded-md bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? 'Opening…' : 'Manage Subscription'}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}
