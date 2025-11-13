import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MatchCard } from '@/components/tournament/MatchCard'
import type { TournamentMatch, CityMinimal } from '@/types/tournament'
import { SimpleBracket } from '@/components/tournament/SimpleBracket'
import { countryTextToCode } from '@/lib/flags'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getActiveAndUpcomingMatches() {
  const supabase = await createClient()
  const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select('id, slug, round_number, match_number, city_a_id, city_b_id, votes_a, votes_b, status, voting_opens_at, voting_closes_at, winner_city_id')
    .in('status', ['active', 'upcoming'] as any)
    .order('round_number', { ascending: true })
    .order('match_number', { ascending: true })

  if (error) throw error
  const cityIds = Array.from(
    new Set((matches || []).flatMap((m) => [m.city_a_id, m.city_b_id]).filter(Boolean) as string[])
  )
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, stadium_name, country')
    .in('id', cityIds.length ? cityIds : ['00000000-0000-0000-0000-000000000000'])

  const map = Object.fromEntries((cities || []).map((c) => [c.id, c])) as Record<string, CityMinimal>
  const withCities = (matches || []).map((m) => ({
    ...m,
    city_a: map[m.city_a_id],
    city_b: map[m.city_b_id],
  })) as (TournamentMatch & { city_a?: CityMinimal; city_b?: CityMinimal })[]
  // Bracket hint mapping: in this round, winners of 1 vs 3 and 5 vs 7 (left column), 2 vs 4 and 6 vs 8 (right column)
  const byNumber = new Map<number, any>()
  for (const m of withCities) if (typeof m.match_number === 'number') byNumber.set(m.match_number, m)
  const pairOf = (n?: number | null) => {
    if (!n && n !== 0) return undefined
    if (n % 4 === 1 || n % 4 === 2) return byNumber.get(n + 2)
    return undefined
  }
  const withHints = withCities.map((m) => {
    const p = pairOf(m.match_number || undefined)
    const pairHint = p ? `${p.city_a?.name || 'City A'} / ${p.city_b?.name || 'City B'}` : undefined
    return { ...m, pairHint }
  })
  return withHints
}

export default async function TournamentHub() {
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    notFound()
  }
  const matches = await getActiveAndUpcomingMatches()
  const cookieStore = await cookies()
  const votedSlugs = new Set(
    cookieStore
      .getAll()
      .map((c) => c.name)
      .filter((n) => n.startsWith('t_voted_'))
      .map((n) => n.replace('t_voted_', ''))
  )
  // Split matches into two columns by match_number parity to visually pair 1-3,5-7 on left and 2-4,6-8 on right
  const left = (matches as any[])
    .filter((m) => (m.match_number ?? 0) % 2 === 1)
    .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))
  const right = (matches as any[])
    .filter((m) => (m.match_number ?? 0) % 2 === 0)
    .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))

  const gapClass = (idx: number, total: number) => {
    // Within each column: small gap inside pairs, larger gap between pairs
    // Order is [1,3,5,7] or [2,4,6,8] -> small after 1 and 5 (idx 0,2), large after 3 (idx 1)
    if (idx === 0 || idx === 2) return 'mb-4'
    if (idx === 1) return 'mb-10'
    return ''
  }
  return (
    <div className="max-w-6xl mx-auto px-4 pt-[30px] pb-10">
      {/* Hero */}
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">Fan Zone City Cup</h1>
        <p className="text-gray-600 mt-2">Vote for the best 2026 host city — no login required.</p>
      </div>
      {/* Round title under hero */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Round 1 — Best First Impression</h2>
        <p className="text-gray-600">Nov 18–21 · Vote in all eight opening matchups. Winners advance to Round 2.</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Live Matchups</h2>
        <Link href="/guides" className="text-blue-600 hover:underline text-sm">Explore City Guides →</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {left.map((m, idx) => (
            <div key={m.id} className={gapClass(idx, left.length)}>
              <MatchCard match={m as any} voted={votedSlugs.has(m.slug)} />
            </div>
          ))}
        </div>
        <div>
          {right.map((m, idx) => (
            <div key={m.id} className={gapClass(idx, right.length)}>
              <MatchCard match={m as any} voted={votedSlugs.has(m.slug)} />
            </div>
          ))}
        </div>
      </div>

      {/* Simple How It Works */}
      <div className="mt-12 border rounded-xl p-6 bg-white/70">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Click a matchup and vote for your city — instantly.</li>
          <li>One vote per match per browser or IP.</li>
          <li>Results become visible after 50+ total votes.</li>
        </ul>
      </div>

      <SimpleBracket matches={matches} />
    </div>
  )
}
