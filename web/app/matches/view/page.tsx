import Link from 'next/link';
import { groupStageMatches, type Match } from '@/lib/matchesData';
import { getCityByName } from '@/lib/cityData';
import { teams } from '@/lib/teamsData';

// Helper to generate slug from match
function generateMatchSlug(match: Match): string {
  return `${match.team1.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-vs-${match.team2.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}

// Check if team is a playoff/TBD team
function isPlayoffTeam(teamName: string): boolean {
  const playoffPatterns = ['UEFA Playoff', 'FIFA Playoff', 'Playoff Winner', 'TBD'];
  return playoffPatterns.some(pattern => teamName.includes(pattern));
}

// Helper to get team flag
function getTeamFlag(teamName: string): string {
  if (isPlayoffTeam(teamName)) return '🏳️';
  const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  return team?.flagEmoji || '🏳️';
}

// Group matches by date
function groupMatchesByDate(matches: Match[]): Map<string, Match[]> {
  const grouped = new Map<string, Match[]>();
  matches.forEach(match => {
    const existing = grouped.get(match.date) || [];
    grouped.set(match.date, [...existing, match]);
  });
  return grouped;
}

export default function MatchViewsIndex() {
  const matchesByDate = groupMatchesByDate(groupStageMatches);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">All 72 Group Stage Matches</h1>
          <p className="text-center text-white/80">City-focused travel guides for every match</p>
          <p className="text-center text-yellow-300/80 text-sm mt-2">⏳ Playoff teams (TBD) will be updated after March 2026</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {Array.from(matchesByDate.entries()).map(([date, matches]) => (
          <div key={date} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              📅 {date}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map(match => {
                const city = getCityByName(match.city);
                const team1Flag = getTeamFlag(match.team1);
                const team2Flag = getTeamFlag(match.team2);
                const slug = generateMatchSlug(match);
                const hasPlayoffTeam = isPlayoffTeam(match.team1) || isPlayoffTeam(match.team2);

                return (
                  <Link
                    key={match.matchNumber}
                    href={`/matches/view/${slug}`}
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border ${hasPlayoffTeam ? 'border-yellow-400' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Match {match.matchNumber}</span>
                      {hasPlayoffTeam && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ TBD</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team1Flag}</span>
                        <span className={`font-semibold ${isPlayoffTeam(match.team1) ? 'text-yellow-600 text-sm' : ''}`}>
                          {isPlayoffTeam(match.team1) ? 'TBD' : match.team1}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">vs</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isPlayoffTeam(match.team2) ? 'text-yellow-600 text-sm' : ''}`}>
                          {isPlayoffTeam(match.team2) ? 'TBD' : match.team2}
                        </span>
                        <span className="text-2xl">{team2Flag}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>{match.time} ET</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏟️</span>
                        <span>{match.stadium}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{match.city}</span>
                      </div>
                      {city && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            city.transit === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                            city.transit === 'GOOD' ? 'bg-blue-100 text-blue-700' :
                            city.transit === 'LIMITED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {city.transit} Transit
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">72</div>
              <div className="text-gray-400">Group Matches</div>
            </div>
            <div>
              <div className="text-3xl font-bold">16</div>
              <div className="text-gray-400">Host Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold">48</div>
              <div className="text-gray-400">Teams</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
