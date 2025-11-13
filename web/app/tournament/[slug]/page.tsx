import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VotingButtons } from '@/components/tournament/VotingButtons'
import { ResultsBar } from '@/components/tournament/ResultsBar'
import { CommentCTA } from '@/components/tournament/CommentCTA'
import { CommentsList } from '@/components/tournament/CommentsList'
import { ShareButtons } from '@/components/tournament/ShareButtons'
import type { TournamentMatch, CityMinimal } from '@/types/tournament'
import { countryTextToCode } from '@/lib/flags'
import { MatchCountdown } from '@/components/tournament/MatchCountdown'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return {
    title: slug.replace(/-/g, ' ') + ' — Fan Zone City Cup',
    openGraph: {
      images: [`/og/tournament/${slug}.png`],
    },
    twitter: {
      images: [`/og/tournament/${slug}.png`],
      card: 'summary_large_image',
    },
  }
}

async function getMatch(slug: string) {
  const supabase = await createClient()
  const { data: match, error } = await supabase
    .from('tournament_matches')
    .select('id, slug, round_number, match_number, city_a_id, city_b_id, votes_a, votes_b, status, voting_opens_at, voting_closes_at, winner_city_id')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!match) return null
  const ids = [match.city_a_id, match.city_b_id]
  type CityRow = { id: string; name: string; slug: string; stadium_name?: string | null; country?: string | null }
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, stadium_name, country')
    .in('id', ids)
  const citiesById: Record<string, CityMinimal> = (cities || []).reduce(
    (acc: Record<string, CityMinimal>, c: CityRow) => {
      acc[c.id] = { id: c.id, name: c.name, slug: c.slug, stadium_name: c.stadium_name || undefined, country: c.country || undefined } as any
      return acc
    },
    {} as Record<string, CityMinimal>
  )
  const withCities: TournamentMatch & { city_a?: CityMinimal; city_b?: CityMinimal } = {
    ...match,
    city_a: citiesById[match.city_a_id],
    city_b: citiesById[match.city_b_id],
  }

  const { data: comments } = await supabase
    .from('tournament_comments')
    .select('id, comment_text, created_at, display_name, city_id, score')
    .eq('match_id', match.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return { match: withCities, comments: comments || [], citiesMap: citiesById }
}

export default async function MatchPage({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    notFound()
  }
  const { slug } = await params
  const data = await getMatch(slug)
  if (!data) {
    return <div className="max-w-3xl mx-auto px-4 py-12">Match not found.</div>
  }
  const { match, comments, citiesMap } = data
  const total = (match.votes_a ?? 0) + (match.votes_b ?? 0)
  const THRESHOLD = 100
  const themeByRound: Record<number, { title: string; prompt: string }> = {
    1: { title: 'Best First Impression', prompt: 'Which city delivers the strongest arrival experience for World Cup fans?' },
    2: { title: 'Best Match Day Experience', prompt: 'Where is the stadium energy and pre‑match buildup the best?' },
    3: { title: 'Best Between‑Match Adventure', prompt: 'Which city has the best food, nightlife, and day trips?' },
    4: { title: 'Ultimate Host City', prompt: 'Which single city would you pick for WC26?' },
  }
  const theme = themeByRound[match.round_number] || { title: '', prompt: '' }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-[30px] pb-10">
      {/* Breadcrumb back to tournament */}
      <div className="mb-2">
        <Link href="/tournament" className="text-sm text-blue-600 hover:underline">← Back to Tournament</Link>
      </div>
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <span>🏆</span>
          <span>Round {match.round_number} of 4 • Closes in <MatchCountdown closesAt={match.voting_closes_at} /></span>
        </div>
        <h1 className="text-3xl font-extrabold">{match.city_a?.name} vs {match.city_b?.name}</h1>
        <p className="text-gray-700 mt-2 text-xl md:text-2xl font-semibold">Round {match.round_number} • {theme.title}</p>
        {theme.prompt && <p className="text-gray-500 text-sm">{theme.prompt}</p>}
      </div>

      {/* Vote buttons: anonymous, instant */}
      {match.status === 'active' && (
        <VotingButtons
          matchSlug={match.slug}
          cityA={{ id: match.city_a_id, name: match.city_a?.name || 'City A' }}
          cityB={{ id: match.city_b_id, name: match.city_b?.name || 'City B' }}
          initialVotesA={match.votes_a}
          initialVotesB={match.votes_b}
          flagA={countryTextToCode(match.city_a?.country || undefined)}
          flagB={countryTextToCode(match.city_b?.country || undefined)}
        />
      )}

      {/* Results when threshold met or if closed */}
      {/* Always show total votes; results bar appears after threshold or when closed */}
      {(total >= THRESHOLD || match.status === 'closed') && (
        <div className="mt-4">
          <ResultsBar a={match.votes_a} b={match.votes_b} />
        </div>
      )}
      {match.status === 'active' && total > 0 && total < THRESHOLD && (
        <div className="mt-1 text-center text-xs text-gray-500">🔒 Vote percentages hidden until 100 votes</div>
      )}
      <div className="mt-1 text-sm text-gray-600 text-center mb-3">
        {total.toLocaleString()} votes • <MatchCountdown closesAt={match.voting_closes_at} />
      </div>

      {/* City guide deep links (prominent cards) */}
      <div className="grid md:grid-cols-2 gap-4 mt-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition">
          <div className="flex items-start gap-2">
            <span className="text-xl">📍</span>
            <div>
              <h3 className="font-bold text-base mb-1">Planning a trip to {match.city_a?.name}?</h3>
              <p className="text-xs text-gray-600 mb-2">Get stadium guides, lodging zones, and local tips</p>
              <a href={`/guides/${match.city_a?.slug}`} className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700">
                View Complete City Guide
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 hover:shadow-md transition">
          <div className="flex items-start gap-2">
            <span className="text-xl">📍</span>
            <div>
              <h3 className="font-bold text-base mb-1">Planning a trip to {match.city_b?.name}?</h3>
              <p className="text-xs text-gray-600 mb-2">Get stadium guides, lodging zones, and local tips</p>
              <a href={`/guides/${match.city_b?.slug}`} className="inline-flex items-center text-red-600 font-semibold hover:text-red-700">
                View Complete City Guide
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons (secondary) */}
      <ShareButtons slug={match.slug} cityA={match.city_a?.name || 'City A'} cityB={match.city_b?.name || 'City B'} votesA={match.votes_a} votesB={match.votes_b} compact />

      {/* Comments */}
      <div className="mt-6 pt-5 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
          <div>
            <h2 className="text-2xl font-bold">Fan Stories & Tips</h2>
            <p className="text-gray-600 text-sm mt-1">Share your experiences to help fellow fans plan their trips</p>
          </div>
          <CommentCTA matchSlug={match.slug} wrapperClassName="" buttonClassName="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700" label="Share a tip or story" />
        </div>
        {/* Featured comment (score > 3) */}
        {(() => {
          const featured = (comments as any[]).filter((c) => (c.score || 0) > 3).sort((a, b) => (b.score || 0) - (a.score || 0))[0]
          if (!featured) return null
          return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-semibold text-sm text-yellow-800 mb-1">Featured Tip</p>
                  <p className="text-gray-700">{featured.comment_text}</p>
                  <p className="text-xs text-gray-500 mt-2">— {featured.display_name || 'Anonymous'} • {featured.score} upvotes</p>
                </div>
              </div>
            </div>
          )
        })()}
        <div className="mt-6">
          <CommentsList comments={comments as any} citiesById={citiesMap} />
        </div>
      </div>
    </div>
  )
}
