"use client"

import { useState } from 'react'

type Props = { email: string }

export default function NotificationsCard({ email }: Props) {
  const [optIn, setOptIn] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  // Placeholder UI; can be wired to `mailing_list` later
  const toggle = async () => {
    setSaving(true)
    try {
      setOptIn((v) => !v)
      // TODO: call API to upsert into `mailing_list`
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="text-sm text-gray-600 mb-3">Newsletter and updates for {email || 'your account'}.</div>
      <button
        onClick={toggle}
        disabled={saving}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm disabled:opacity-50"
      >
        {saving ? 'Saving…' : optIn ? 'Unsubscribe' : 'Subscribe'}
      </button>
      <div className="mt-2 text-xs text-gray-500">This is a preview control. Hook into `mailing_list` later.</div>
    </div>
  )
}
