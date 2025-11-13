"use client"
import { useState } from 'react'

export function CommentForm({ matchSlug, cityId, onSuccess }: { matchSlug: string; cityId?: string; onSuccess?: () => void }) {
  const [text, setText] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/tournament/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchSlug, text, cityId: cityId || null, displayName: displayName || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to post')
      } else {
        setText('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        onSuccess?.()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white/80">
      <div className="flex gap-3 mb-2">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Name (optional)"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share a tip or story (no login required)"
        rows={4}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <div className="mt-2 flex items-center gap-3">
        <button onClick={submit} disabled={submitting || text.trim().length === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
          Submit comment
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
        {success && <span className="text-sm text-green-600">Posted!</span>}
      </div>
    </div>
  )
}
