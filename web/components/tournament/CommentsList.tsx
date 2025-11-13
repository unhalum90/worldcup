"use client"
import type { CityMinimal } from '@/types/tournament'
import { useState } from 'react'

interface Comment {
  id: string
  comment_text: string
  created_at: string
  display_name: string | null
  city_id: string | null
  score?: number
}

export function CommentsList({ comments, citiesById }: { comments: Comment[]; citiesById?: Record<string, CityMinimal> }) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries((comments || []).map((c) => [c.id, c.score ?? 0]))
  )
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  async function upvote(id: string) {
    setBusy((b) => ({ ...b, [id]: true }))
    try {
      const res = await fetch('/api/tournament/comment/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        setScores((s) => ({ ...s, [id]: data.score }))
      }
    } finally {
      setBusy((b) => ({ ...b, [id]: false }))
    }
  }

  if (!comments || comments.length === 0) {
    return <div className="text-sm text-gray-500">No comments yet. Be the first!</div>
  }
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="border rounded-md p-3 bg-white/70">
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>{c.display_name || 'Anonymous'}</span>
            <span>{new Date(c.created_at).toLocaleString()}</span>
          </div>
          {c.city_id && citiesById?.[c.city_id] && (
            <div className="text-xs text-gray-500 mt-1">About: {citiesById[c.city_id].name}</div>
          )}
          <p className="mt-2 text-sm">{c.comment_text}</p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <button
              disabled={!!busy[c.id]}
              onClick={() => upvote(c.id)}
              className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-60"
              aria-label="Upvote comment"
            >
              ▲ Upvote
            </button>
            <span className="text-gray-600">{scores[c.id] ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
