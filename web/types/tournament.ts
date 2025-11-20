export type MatchStatus = 'upcoming' | 'active' | 'closed'

export interface CityMinimal {
  id: string
  name: string
  slug: string
  stadium_name?: string | null
  country?: string | null
}

export interface TournamentMatch {
  id: string
  slug: string
  round_number: number
  match_number: number | null
  city_a_id: string
  city_b_id: string
  votes_a: number
  votes_b: number
  status: MatchStatus
  voting_opens_at: string | null
  voting_closes_at: string | null
  winner_city_id: string | null
  city_a?: CityMinimal
  city_b?: CityMinimal
}

export interface VoteResponse {
  success: boolean
  error?: string
  votes_a?: number
  votes_b?: number
}
