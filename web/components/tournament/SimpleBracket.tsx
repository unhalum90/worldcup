import Link from 'next/link'
import type { TournamentMatch, CityMinimal } from '@/types/tournament'

export function SimpleBracket({
  matches,
}: {
  matches: (TournamentMatch & { city_a?: CityMinimal; city_b?: CityMinimal })[]
}) {
  const byRound = new Map<number, (TournamentMatch & { city_a?: CityMinimal; city_b?: CityMinimal })[]>()
  for (const m of matches) {
    const r = m.round_number || 1
    if (!byRound.has(r)) byRound.set(r, [])
    byRound.get(r)!.push(m)
  }
  const rounds = Array.from(byRound.keys()).sort((a, b) => a - b)

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-3">Bracket</h3>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {rounds.map((r) => (
          <div key={r} className="border rounded-lg p-3 bg-white/60">
            <div className="text-sm font-semibold mb-2">Round {r}</div>
            <ul className="space-y-2">
              {byRound
                .get(r)!
                .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))
                .map((m) => (
                  <li key={m.id} className="text-sm">
                    <Link href={`/tournament/${m.slug}`} className="hover:underline">
                      {m.city_a?.name || 'City A'} vs {m.city_b?.name || 'City B'}
                    </Link>
                    {m.status === 'closed' && m.winner_city_id && (
                      <span className="ml-2 text-green-700">(
                        Winner: {m.winner_city_id === m.city_a_id ? m.city_a?.name : m.city_b?.name}
                      )</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

