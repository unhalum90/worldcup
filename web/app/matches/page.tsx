import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { teams } from '@/lib/teamsData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const metadata: Metadata = {
  title: 'All Matches - FIFA World Cup 2026 | WC26 Fan Zone',
  description: 'Complete guide to all 72 group stage matches of the 2026 FIFA World Cup. Travel guides, stadium info, and fan experiences for every match.',
  keywords: ['World Cup 2026', 'matches', 'fixtures', 'schedule', 'FIFA', 'group stage'],
  alternates: {
    canonical: 'https://worldcup26fanzone.com/matches',
  },
  openGraph: {
    title: 'All Matches - FIFA World Cup 2026',
    description: 'Complete guide to all 72 group stage matches of the 2026 FIFA World Cup.',
    url: 'https://worldcup26fanzone.com/matches',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

interface MatchPage {
  match_number: number;
  slug: string;
  team1: string;
  team2: string;
  match_date: string;
  match_time: string;
  city: string;
  stadium: string;
  status: 'draft' | 'published';
}

async function getPublishedMatches(): Promise<MatchPage[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('match_pages')
    .select('match_number, slug, team1, team2, match_date, match_time, city, stadium, status')
    .eq('status', 'published')
    .order('match_number', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

function findTeamInfo(teamName: string) {
  const normalizedName = teamName.toLowerCase();
  return teams.find(t => 
    t.name.toLowerCase() === normalizedName ||
    t.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(t.name.toLowerCase())
  );
}

// Group matches by date
function groupMatchesByDate(matches: MatchPage[]): Record<string, MatchPage[]> {
  return matches.reduce((acc, match) => {
    if (!acc[match.match_date]) {
      acc[match.match_date] = [];
    }
    acc[match.match_date].push(match);
    return acc;
  }, {} as Record<string, MatchPage[]>);
}

export default async function MatchesPage() {
  const matches = await getPublishedMatches();
  const matchesByDate = groupMatchesByDate(matches);
  const dates = Object.keys(matchesByDate).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              ⚽ Match Travel Guides
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Your ultimate guide to every match of the 2026 FIFA World Cup. Travel tips, stadium info, and fan experiences.
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">{matches.length}</div>
                <div className="text-sm text-blue-200">Guides Published</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">72</div>
                <div className="text-sm text-blue-200">Group Stage Matches</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">16</div>
                <div className="text-sm text-blue-200">Host Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Match guides coming soon!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;re working on detailed travel guides for every match. Check back soon or subscribe to get notified.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {dates.map(date => (
              <div key={date}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">
                  📅 {date}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchesByDate[date].map(match => {
                    const team1Info = findTeamInfo(match.team1);
                    const team2Info = findTeamInfo(match.team2);
                    
                    return (
                      <Link
                        key={match.match_number}
                        href={`/matches/${match.slug}`}
                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500"
                      >
                        <div className="p-6">
                          {/* Match Number Badge */}
                          <div className="text-xs font-semibold text-blue-600 mb-3">
                            Match {match.match_number}
                          </div>

                          {/* Teams */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {team1Info && (
                                <span className="text-3xl">{team1Info.flagEmoji}</span>
                              )}
                              <span className="font-semibold text-gray-900">{match.team1}</span>
                            </div>
                            <span className="text-gray-400 font-medium">vs</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">{match.team2}</span>
                              {team2Info && (
                                <span className="text-3xl">{team2Info.flagEmoji}</span>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {match.match_time} ET
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {match.city}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {match.stadium}
                            </div>
                          </div>

                          {/* View Button */}
                          <div className="mt-4 pt-4 border-t">
                            <span className="text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
                              View Travel Guide →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
