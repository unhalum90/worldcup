"use client"
import React, { useEffect, useState } from 'react'

interface RoundIntroModalProps {
  roundNumber?: number
}

export default function RoundIntroModal({ roundNumber = 1 }: RoundIntroModalProps) {
  const storageKey = `t_round_intro_shown_round_${roundNumber}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const shown = localStorage.getItem(storageKey)
      if (!shown) setVisible(true)
    } catch (e) {
      // ignore
      setVisible(false)
    }
  }, [storageKey])

  function handleClose() {
    try {
      localStorage.setItem(storageKey, '1')
    } catch (e) {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-xl">
        {/* Constrain the image to a 600px tall box and preserve aspect ratio */}
        <div className="w-full max-h-[600px] overflow-hidden flex items-center justify-center bg-white">
          <img
            src="/round1.png"
            alt={`Round ${roundNumber}`}
            className="w-full h-auto max-h-[600px] object-contain"
          />
        </div>
        <div className="p-4 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            Vote now
          </button>
        </div>
      </div>
    </div>
  )
}
