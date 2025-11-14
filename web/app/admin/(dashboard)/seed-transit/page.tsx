'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SeedTransitPage() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string; slug?: string } | null>(null)

  async function seed() {
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/blog/seed-transit', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to seed')
      setResult({ ok: true, slug: data.slug })
    } catch (e: any) {
      setResult({ error: e?.message || String(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Seed Transit Article</h1>
      <p className="text-gray-600 mb-6">Insert or update the published post for the transit-friendly lodging zones at /blog/transit-friendly-lodging-zones-2026.</p>

      <button
        onClick={seed}
        disabled={busy}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? 'Seeding…' : 'Seed/Update Article'}
      </button>

      {result?.ok && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">Done.</p>
          <p>
            View post:{' '}
            <Link href={`/blog/${result.slug}`} className="text-blue-600 hover:underline">
              /blog/{result.slug}
            </Link>
          </p>
        </div>
      )}
      {result?.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">{result.error}</div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p>
          After verifying the article renders correctly, you can remove the static page if it exists in any other branch to let the CMS version handle the URL.
        </p>
      </div>
    </div>
  )
}

