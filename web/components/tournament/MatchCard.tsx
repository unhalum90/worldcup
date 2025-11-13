import Link from 'next/link'
import type { TournamentMatch, CityMinimal } from '@/types/tournament'
import { countryTextToCode } from '@/lib/flags'
import { MatchCountdown } from './MatchCountdown'

export interface MatchCardProps {
  match: TournamentMatch & { city_a?: CityMinimal; city_b?: CityMinimal; pairHint?: string }
  voted?: boolean
}

export function MatchCard({ match, voted }: MatchCardProps) {
  const total = (match.votes_a ?? 0) + (match.votes_b ?? 0)
  const aPct = total > 0 ? Math.round((match.votes_a / total) * 100) : 50
  const bPct = 100 - aPct
  const THRESHOLD = 100

  return (
    <Link href={`/tournament/${match.slug}`} className="block group">
      <div className="border rounded-xl p-5 bg-white/70 hover:shadow-lg transition relative">
        {voted && (
          <div className="absolute top-2 right-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">✓ You voted</div>
        )}
        <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">
          Round {match.round_number}
        </div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 text-xl font-bold">
              {match.city_a?.name || 'City A'}
              {match.city_a?.country && (
                <img
                  src={`/flags/${countryTextToCode(match.city_a.country) || 'us'}.svg`}
                  alt=""
                  width={20}
                  height={14}
                />
              )}
            </div>
            {match.city_a?.stadium_name && (
              <div className="text-xs text-gray-500">{match.city_a.stadium_name}</div>
            )}
          </div>
          <div className="text-2xl font-extrabold text-gray-300">VS</div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 text-xl font-bold">
              {match.city_b?.name || 'City B'}
              {match.city_b?.country && (
                <img
                  src={`/flags/${countryTextToCode(match.city_b.country) || 'us'}.svg`}
                  alt=""
                  width={20}
                  height={14}
                />
              )}
            </div>
            {match.city_b?.stadium_name && (
              <div className="text-xs text-gray-500">{match.city_b.stadium_name}</div>
            )}
          </div>
        </div>

        {match.status === 'active' && (total >= THRESHOLD) && (
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-500/50 text-blue-800 text-xs font-bold flex items-center pl-2"
              style={{ width: `${aPct}%` }}
            >
              {aPct}%
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 bg-red-500/50 text-red-800 text-xs font-bold flex items-center pr-2 justify-end"
              style={{ width: `${bPct}%` }}
            >
              {bPct}%
            </div>
          </div>
        )}
        {match.status === 'active' && total > 0 && total < THRESHOLD && (
          <div className="text-xs text-gray-500 mb-2">🔒 Vote percentages hidden until 100 votes</div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{total.toLocaleString()} votes</span>
          <span className="rounded-full px-2 py-0.5 border bg-gray-50">{match.status}</span>
        </div>

        {match.voting_closes_at && (
          <div className="text-xs text-gray-500 mt-1">Closes in <MatchCountdown closesAt={match.voting_closes_at} /></div>
        )}

        {match.status === 'closed' && match.winner_city_id && (
          <div className="mt-2 text-center text-green-700 font-semibold">
            Winner: {match.winner_city_id === match.city_a_id ? match.city_a?.name : match.city_b?.name}
          </div>
        )}

        {match.pairHint && (
          <div className="mt-2 flex items-center text-[11px] text-gray-500">
            <div className="h-px bg-gray-300 flex-1 mr-2" />
            Faces winner of {match.pairHint}
          </div>
        )}
      </div>
    </Link>
  )
}
