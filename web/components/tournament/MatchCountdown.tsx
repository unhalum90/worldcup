"use client"
import { useEffect, useState } from 'react'

function format(ms: number) {
  if (ms <= 0) return 'Closed'
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function MatchCountdown({ closesAt }: { closesAt?: string | null }) {
  const [text, setText] = useState<string>(() => {
    if (!closesAt) return ''
    const delta = new Date(closesAt).getTime() - Date.now()
    return format(delta)
  })

  useEffect(() => {
    if (!closesAt) return
    const id = setInterval(() => {
      const delta = new Date(closesAt).getTime() - Date.now()
      setText(format(delta))
    }, 30000)
    return () => clearInterval(id)
  }, [closesAt])

  if (!closesAt) return null
  return <span className="text-xs text-gray-600">Closes in {text}</span>
}

