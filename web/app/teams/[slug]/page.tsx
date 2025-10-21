import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeamBySlug, teams } from '@/lib/teamsData';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return teams.map((team) => ({
    slug: team.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    return {
      title: 'Team Not Found',
    };
  }

  return {
    title: `Follow ${team.name} to the 2026 World Cup | Fan Zone Network`,
    description: `Track ${team.name}'s journey to the 2026 World Cup — fixtures, cities, travel tips, and fan experiences across North America.`,
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div 
        className="relative text-white py-24 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        }}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/teams" className="text-white/80 hover:text-white flex items-center text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Teams
            </Link>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="text-8xl md:text-9xl drop-shadow-lg">
              {team.flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span 
                  className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm"
                >
                  {team.confederation}
                </span>
                <span 
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    team.isProvisional 
                      ? 'bg-yellow-500 text-yellow-900' 
                      : 'bg-green-500 text-green-900'
                  }`}
                >
                  {team.isProvisional ? 'PROVISIONAL' : 'QUALIFIED'}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                Follow {team.name} to the 2026 World Cup
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6 drop-shadow">
                {team.isProvisional 
                  ? `Likely heading to North America in 2026 — stay tuned for official confirmation.`
                  : `Heading to North America in 2026 — the journey begins here.`
                }
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Get notified when {team.name}'s match cities are announced →
          </button>
        </div>
      </div>

      {/* Tournament Status Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm mb-12">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                📅 Awaiting Group Draw
              </h3>
              <p className="text-yellow-700">
                FIFA will announce final fixtures and host cities on <strong>December 5, 2025</strong>. 
                Bookmark this page — it will automatically update the moment details are confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Group Stage Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">🗓️</span>
            Tournament Schedule
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Match</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Opponent</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">City</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">Match 1</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">Match 2</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold">Match 3</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                  <td className="py-4 px-4 text-gray-500">TBD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Snapshot */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">⚽</span>
            Team Snapshot
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Confederation:</span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {team.confederation}
                </span>
              </div>
              {team.appearances && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">World Cup Appearances:</span>
                  <span className="text-gray-900 font-bold">{team.appearances}</span>
                </div>
              )}
              {team.bestFinish && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Best Finish:</span>
                  <span className="text-gray-900 font-bold">{team.bestFinish}</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {team.coach && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Coach:</span>
                  <span className="text-gray-900 font-bold">{team.coach}</span>
                </div>
              )}
              {team.fifaRanking && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">FIFA Ranking:</span>
                  <span className="text-gray-900 font-bold">#{team.fifaRanking}</span>
                </div>
              )}
              {team.starPlayers && team.starPlayers.length > 0 && (
                <div className="py-3">
                  <span className="font-semibold text-gray-700 block mb-3">Star Players:</span>
                  <div className="space-y-2">
                    {team.starPlayers.map((player, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-xs font-bold px-2 py-1 rounded text-white"
                            style={{ backgroundColor: team.primaryColor }}
                          >
                            #{typeof player === 'object' && player.number ? player.number : ''}
                          </span>
                          <div>
                            <div className="font-bold text-gray-900">
                              {typeof player === 'object' ? player.name : player}
                            </div>
                            {typeof player === 'object' && player.position && (
                              <div className="text-xs text-gray-500">
                                {player.position}
                              </div>
                            )}
                          </div>
                        </div>
                        {typeof player === 'object' && player.club && (
                          <div className="text-sm text-gray-600 text-right">
                            <div className="font-semibold">{player.club}</div>
                            {player.age && (
                              <div className="text-xs text-gray-400">Age {player.age}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Greatest Moments */}
        {team.greatestMoments && team.greatestMoments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🏆</span>
              Greatest World Cup Moments
            </h2>
            
            <div className="space-y-6">
              {team.greatestMoments.map((moment, index) => (
                <div key={index} className="border-l-4 pl-6 py-2" style={{ borderColor: team.primaryColor }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {index + 1}. {moment.title}
                  </h3>
                  <p className="text-gray-700 mb-2">{moment.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {moment.year && (
                      <span className="text-gray-500 font-semibold">
                        {moment.year}
                      </span>
                    )}
                    {moment.tournament && (
                      <span className="text-gray-500">
                        {moment.tournament}
                      </span>
                    )}
                    {moment.video_search_query && (
                      <span className="text-xs text-gray-400 italic">
                        🎥 Search: "{moment.video_search_query}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Timeline */}
        {team.historicalTimeline && team.historicalTimeline.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">📜</span>
              Historical Timeline
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Year</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Event</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {team.historicalTimeline.map((event, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-bold text-gray-900">{event.year}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {typeof event === 'object' && 'event' in event ? event.event : (event as any).highlight}
                      </td>
                      {typeof event === 'object' && 'category' in event && event.category && (
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            event.category === 'championship' ? 'bg-yellow-100 text-yellow-800' :
                            event.category === 'notable_performance' ? 'bg-blue-100 text-blue-800' :
                            event.category === 'first_appearance' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.category.replace('_', ' ')}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fan Culture */}
        {team.fanCulture ? (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🎺</span>
              Fan Culture
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Traditions</h3>
                <p className="text-gray-700">{team.fanCulture.traditions}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border-l-4" style={{ borderColor: team.primaryColor }}>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">🎵</span> Famous Chant
                  </h3>
                  <p className="text-gray-700 italic">"{team.fanCulture.famous_chant}"</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border-l-4" style={{ borderColor: team.primaryColor }}>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">👥</span> Supporter Groups
                  </h3>
                  <p className="text-gray-700">{team.fanCulture.supporter_groups}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">🏟️</span> Match Day Atmosphere
                </h3>
                <p className="text-gray-700">{team.fanCulture.match_day_atmosphere}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🧭</span>
              Travel & Fan Culture
            </h2>
            
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                Until match cities are announced, we're gathering resources and tips for {team.name} supporters 
                traveling to North America for the World Cup.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🍽️</div>
                  <h3 className="font-bold text-gray-900 mb-2">Local Cuisine</h3>
                  <p className="text-sm text-gray-600">
                    Find authentic food and restaurants from home in U.S. host cities
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🎵</div>
                  <h3 className="font-bold text-gray-900 mb-2">Fan Traditions</h3>
                  <p className="text-sm text-gray-600">
                    Bring your chants, drums, and flags to create an unforgettable atmosphere
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">✈️</div>
                  <h3 className="font-bold text-gray-900 mb-2">Travel Tips</h3>
                  <p className="text-sm text-gray-600">
                    Essential information for visiting Canada, Mexico, and the United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fun Facts */}
        {team.funFacts && team.funFacts.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-8 mb-12 border border-purple-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">💡</span>
              Did You Know?
            </h2>
            
            <div className="space-y-3">
              {team.funFacts.map((fact, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/60 p-4 rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 flex-1">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host Cities Announcement (Placeholder) */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <span className="text-4xl mr-3">🗺️</span>
            Host Cities
          </h2>
          <p className="text-blue-100 mb-6">
            Once the group draw is announced on December 5, 2025, this section will show you exactly which cities 
            {team.name} will play in, along with stadium information and travel guides.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/planner"
              className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Plan Your Trip →
            </Link>
            <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Download Fan Pack (Coming Soon)
            </button>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-4xl mr-3">💬</span>
            Community
          </h2>
          
          <p className="text-gray-700 mb-6">
            Discuss {team.name}'s chances, share travel plans, or post photos from past tournaments.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href={`/forums/${team.slug}`}
              className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
            >
              <div className="text-2xl mb-2">🗨️</div>
              <h3 className="font-bold text-gray-900 mb-1">Team Forum</h3>
              <p className="text-sm text-gray-600">Join the discussion</p>
            </Link>
            <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-bold text-gray-900 mb-1">Discord</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-bold text-gray-900 mb-1">Fan Groups</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Waitlist Footer */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Be the first to know when {team.name}'s fixtures and host cities are confirmed. 
            Join the waitlist for exclusive updates and early access to travel guides.
          </p>
          <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            👉 Join the {team.name} 2026 Fan List
          </button>
        </div>
      </div>
    </div>
  );
}
