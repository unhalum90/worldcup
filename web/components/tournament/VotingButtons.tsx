"use client"
import { useState, useTransition } from 'react'
import { VoteResponse } from '@/types/tournament'

export function VotingButtons({
  matchSlug,
  cityA,
  cityB,
  initialVotesA,
  initialVotesB,
  flagA,
  flagB,
  showCTAAfterVote = true,
}: {
  matchSlug: string
  cityA: { id: string; name: string }
  cityB: { id: string; name: string }
  initialVotesA: number
  initialVotesB: number
  flagA?: string
  flagB?: string
  showCTAAfterVote?: boolean
}) {
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [result, setResult] = useState<VoteResponse | null>(null)
  const [isPending, startTransition] = useTransition()
  const [aCount, setACount] = useState<number>(initialVotesA || 0)
  const [bCount, setBCount] = useState<number>(initialVotesB || 0)

  async function cast(cityId: string) {
    setSubmitting(cityId)
    try {
      const res = await fetch('/api/tournament/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchSlug, cityId }),
      })
      const data = (await res.json()) as VoteResponse
      setResult(data)
      if (data?.success) {
        if (typeof data.votes_a === 'number') setACount(data.votes_a)
        if (typeof data.votes_b === 'number') setBCount(data.votes_b)
      }
    } finally {
      setSubmitting(null)
      startTransition(() => {})
    }
  }

  const disabled = Boolean(submitting || (result && result.success === false))

  const Badge = ({ count }: { count: number }) => (
    <span
      className="absolute -top-3 -right-3 h-6 min-w-[1.5rem] px-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow ring-2 ring-white"
      aria-label={`${count} votes`}
    >
      {count}
    </span>
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 my-6">
        <button
        onClick={() => cast(cityA.id)}
        disabled={disabled}
        className="relative w-full md:flex-1 md:max-w-xs px-6 py-4 min-h-[56px] border-4 border-blue-500 rounded-xl hover:bg-blue-50 transition disabled:opacity-60"
      >
        <Badge count={aCount} />
        <div className="text-2xl font-bold mb-1 inline-flex items-center gap-2">
          {cityA.name}
          {flagA && <img src={`/flags/${flagA}.svg`} alt="" width={20} height={14} />}
        </div>
        <div className="text-blue-700 font-semibold">Vote for {cityA.name}</div>
        </button>
  <div className="text-3xl font-extrabold text-gray-300 md:mx-2 my-2 md:my-0">VS</div>
        <button
        onClick={() => cast(cityB.id)}
        disabled={disabled}
        className="relative w-full md:flex-1 md:max-w-xs px-6 py-4 min-h-[56px] border-4 border-red-500 rounded-xl hover:bg-red-50 transition disabled:opacity-60"
      >
        <Badge count={bCount} />
        <div className="text-2xl font-bold mb-1 inline-flex items-center gap-2">
          {cityB.name}
          {flagB && <img src={`/flags/${flagB}.svg`} alt="" width={20} height={14} />}
        </div>
        <div className="text-red-700 font-semibold">Vote for {cityB.name}</div>
        </button>
      </div>

      {showCTAAfterVote && result?.success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4 text-center">
          <h3 className="font-bold text-lg mb-2">Get Round 2 matchups in your inbox</h3>
          <p className="text-gray-600 text-sm mb-4">Plus: exclusive city tips and draw day analysis (Dec 5)</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              const email = String(fd.get('email') || '')
              if (!email) return
              try {
                await fetch('/api/newsletter/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, source: 'tournament_cta' }),
                })
                alert('Thanks for subscribing!')
                ;(e.currentTarget as HTMLFormElement).reset()
              } catch {
                alert('Subscription failed. Please try again later.')
              }
            }}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input name="email" type="email" placeholder="you@email.com" className="flex-1 px-4 py-2 border rounded" required />
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Subscribe</button>
          </form>
        </div>
      )}
    </div>
  )
}
