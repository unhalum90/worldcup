"use client"
import { useCallback } from 'react'

export function ShareButtons({ slug, cityA, cityB, votesA, votesB, compact = true }: { slug: string; cityA: string; cityB: string; votesA: number; votesB: number; compact?: boolean }) {
  const url = typeof window !== 'undefined' ? window.location.origin + `/tournament/${slug}` : `/tournament/${slug}`
  const total = (votesA || 0) + (votesB || 0)
  const aPct = total > 0 ? Math.round((votesA / total) * 100) : 0
  const bPct = total > 0 ? 100 - aPct : 0

  const redditText = `${cityA} vs ${cityB} is ${aPct}-${bPct} with ${total} votes. Cast yours:`
  const xText = `🏆 ${cityA} vs ${cityB}: Who has the better first impression? Vote: ${url} #WorldCup2026`

  const shareReddit = useCallback(() => {
    const link = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(redditText)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }, [url])

  const shareX = useCallback(() => {
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }, [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard')
    } catch {
      // Fallback
      const dummy = document.createElement('input')
      dummy.value = url
      document.body.appendChild(dummy)
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
      alert('Link copied to clipboard')
    }
  }, [url])

  return (
    <div className={`flex items-center justify-center gap-3 ${compact ? 'py-4 border-t border-gray-200' : 'mt-6'}`}>
      <span className="text-sm text-gray-500 mr-2">Share this matchup:</span>
      <button onClick={shareReddit} className={`px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition`}>Reddit</button>
      <button onClick={shareX} className={`px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-gray-800 transition`}>X</button>
      <button onClick={copy} className={`px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition`}>Copy Link</button>
    </div>
  )
}
