"use client"
import { useState } from 'react'

export function AdminMatchTableClient({ matches }: { matches: any[] }) {
  const [busy, setBusy] = useState<string | null>(null)

  async function update(slug: string, body: any) {
    setBusy(slug)
    try {
      const res = await fetch('/api/admin/tournament/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...body }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d?.error || 'Failed')
      } else {
        location.reload()
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <table className="w-full text-sm border">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-2 text-left">Round</th>
          <th className="p-2 text-left">Match</th>
          <th className="p-2 text-left">Slug</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Votes</th>
          <th className="p-2 text-left">Winner</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {matches.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2">{m.round_number}</td>
            <td className="p-2">{m.match_number ?? ''}</td>
            <td className="p-2">{m.slug}</td>
            <td className="p-2">{m.status}</td>
            <td className="p-2">{(m.votes_a ?? 0) + (m.votes_b ?? 0)}</td>
            <td className="p-2">{m.winner_city_id ? (m.winner_city_id === m.city_a_id ? m.city_a?.name : m.city_b?.name) : ''}</td>
            <td className="p-2">
              <div className="flex flex-wrap gap-2">
                <button disabled={busy === m.slug} className="px-2 py-1 border rounded" onClick={() => update(m.slug, { status: 'active' })}>
                  Activate
                </button>
                <button disabled={busy === m.slug} className="px-2 py-1 border rounded" onClick={() => update(m.slug, { status: 'closed' })}>
                  Close
                </button>
                <button
                  disabled={busy === m.slug}
                  className="px-2 py-1 border rounded"
                  onClick={() => update(m.slug, { status: 'closed', winner_city_id: m.city_a_id })}
                >
                  Winner: {m.city_a?.name}
                </button>
                <button
                  disabled={busy === m.slug}
                  className="px-2 py-1 border rounded"
                  onClick={() => update(m.slug, { status: 'closed', winner_city_id: m.city_b_id })}
                >
                  Winner: {m.city_b?.name}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

