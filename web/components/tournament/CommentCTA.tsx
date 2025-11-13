"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommentModal } from './CommentModal'

export function CommentCTA({ matchSlug, buttonClassName, wrapperClassName, label = 'Share a tip or story' }: { matchSlug: string; buttonClassName?: string; wrapperClassName?: string; label?: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  return (
    <>
      <div className={wrapperClassName || 'flex items-center justify-center mt-4'}>
        <button
          onClick={() => setOpen(true)}
          className={buttonClassName || 'px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:brightness-110 shadow'}
        >
          {label}
        </button>
      </div>
      <CommentModal
        open={open}
        onClose={() => setOpen(false)}
        matchSlug={matchSlug}
        onPosted={() => {
          setOpen(false)
          // Refresh server-rendered comments
          router.refresh()
        }}
      />
    </>
  )
}
