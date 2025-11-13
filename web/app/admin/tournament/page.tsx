import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AdminMatchTableClient } from './AdminMatchTableClient'

export const dynamic = 'force-dynamic'

async function getMatches() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournament_matches')
    .select('id, slug, status, round_number, match_number, votes_a, votes_b, winner_city_id, city_a_id, city_b_id')
    .order('round_number')
    .order('match_number')
  if (error) throw error
  const matches = data || []

  const cityIds = Array.from(new Set(matches.flatMap((m: any) => [m.city_a_id, m.city_b_id])))
  type CityRow = { id: string; name: string; slug: string }
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug')
    .in('id', cityIds.length ? cityIds : ['00000000-0000-0000-0000-000000000000'])
  const cityMap: Record<string, CityRow> = (cities || []).reduce((acc: Record<string, CityRow>, c: CityRow) => {
    acc[c.id] = c
    return acc
  }, {} as Record<string, CityRow>)
  return matches.map((m: any) => ({ ...m, city_a: cityMap[m.city_a_id], city_b: cityMap[m.city_b_id] }))
}

async function AdminTournamentPage() {
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    notFound()
  }
  const matches = await getMatches()
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Tournament Admin</h1>
      <div className="text-sm text-gray-600 mb-4">Use the controls below to activate/close matches and set winners.</div>
      <AdminMatchTableClient matches={matches as any} />
    </div>
  )
}

export default AdminTournamentPage
