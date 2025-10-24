import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeamBySlug, teams } from '@/lib/teamsData';
import MiniCountdown from '@/components/MiniCountdown';

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

  // Schema.org structured data for SEO
  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": team.name,
    "sport": "Soccer",
    "memberOf": {
      "@type": "SportsOrganization",
      "name": team.confederation
    },
    "description": `Follow ${team.name}'s journey to the 2026 FIFA World Cup in Canada, Mexico, and the United States.`,
    "url": `https://worldcup26.app/teams/${team.slug}`,
    ...(team.coach && {
      "coach": {
        "@type": "Person",
        "name": team.coach
      }
    }),
    ...(team.starPlayers && team.starPlayers.length > 0 && {
      "athlete": team.starPlayers.map(player => ({
        "@type": "Person",
        "name": typeof player === 'object' ? player.name : player,
        ...(typeof player === 'object' && player.position && { "jobTitle": player.position })
      }))
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
      />
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link 
              href="/teams" 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to All Teams</span>
              <span className="sm:hidden">Teams</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-2xl">{team.flagEmoji}</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{team.name}</span>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Get notified when {team.name}'s match cities are announced →
            </button>
            
            {/* Social Share Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-white/80 text-sm hidden sm:inline">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=Follow ${encodeURIComponent(team.name)} to the 2026 World Cup!&url=${encodeURIComponent(`https://worldcup26.app/teams/${team.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
                title="Share on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={`https://www.threads.net/intent/post?text=Follow ${encodeURIComponent(team.name)} to the 2026 World Cup! https://worldcup26.app/teams/${team.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
                title="Share on Threads"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.954 12.954 0 0 0-2.84-.133c-1.235.07-2.177.423-2.802.995-.582.533-.9 1.23-.858 1.962.048.879.49 1.619 1.24 2.086.652.406 1.52.608 2.442.568 1.301-.056 2.29-.544 2.943-1.452.563-.783.9-1.743 1.003-2.856-.775-.312-1.65-.473-2.6-.473-.938 0-1.8.184-2.567.547l-.365-1.424c.844-.401 1.806-.605 2.932-.605 1.44 0 2.704.41 3.762 1.216.616.469 1.096 1.045 1.427 1.713.696 1.404.755 3.883-1.229 5.86-1.702 1.699-3.813 2.498-6.84 2.525z"/>
                </svg>
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(`https://worldcup26.app/teams/${team.slug}`)}&title=Follow ${encodeURIComponent(team.name)} to the 2026 World Cup!`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
                title="Share on Reddit"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
          </div>
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
              <div className="mt-3">
                <MiniCountdown 
                  target={"2025-12-05T17:00:00Z"}
                  label="Group Draw"
                />
              </div>
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
            
            <div className="space-y-8">
              {team.greatestMoments.map((moment, index) => (
                <div key={index} className="border-l-4 pl-6 py-2" style={{ borderColor: team.primaryColor }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {index + 1}. {moment.title}
                  </h3>
                  <p className="text-gray-700 mb-3">{moment.description}</p>
                  <div className="flex items-center gap-4 text-sm mb-4">
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
                  </div>
                  
                  {/* Video Embed Placeholder */}
                  {moment.video_search_query && (
                    <div className="mt-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span className="text-gray-600 font-semibold">Video Highlight</span>
                      </div>
                      <p className="text-sm text-gray-500 text-center mb-2">
                        Search YouTube: <span className="font-mono italic">"{moment.video_search_query}"</span>
                      </p>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(moment.video_search_query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center mt-3"
                      >
                        <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          Watch on YouTube
                        </span>
                      </a>
                    </div>
                  )}
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

        {/* Community Section removed per request */}

        {/* Newsletter CTA Footer */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Fan Zone Insider
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our free weekly newsletter for World Cup 2026 fans. Get city updates, travel tips, and early access to new guides as they launch.
          </p>
          <button
            onClick={() => window.dispatchEvent(new Event('fz:open-subscribe'))}
            className="inline-flex items-center gap-2 bg-[color:var(--color-accent-red)] text-white px-8 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-colors shadow-lg"
          >
            Subscribe Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
