"use client"
import { CommentForm } from './CommentForm'

export function CommentModal({
  open,
  onClose,
  matchSlug,
  cityId,
  onPosted,
}: {
  open: boolean
  onClose: () => void
  matchSlug: string
  cityId?: string
  onPosted?: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">Share a tip or story</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-5">
          <CommentForm matchSlug={matchSlug} cityId={cityId} onSuccess={onPosted} />
        </div>
      </div>
    </div>
  )
}

