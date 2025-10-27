import { Metadata } from 'next';
import Link from 'next/link';
import { teams, getQualifiedTeams, getProvisionalTeams } from '@/lib/teamsData';

export const metadata: Metadata = {
  title: 'Qualified Teams - FIFA World Cup 2026 | WC26 Fan Zone',
  description: 'View all 28 qualified teams for the 2026 FIFA World Cup in North America. Follow your favorite national team, view fixtures, and get travel tips for each team\'s matches.',
  keywords: ['World Cup 2026', 'qualified teams', 'FIFA', 'national teams', 'soccer', 'football'],
  alternates: {
    canonical: 'https://worldcup26fanzone.com/teams',
  },
  openGraph: {
    title: 'Qualified Teams - FIFA World Cup 2026',
    description: 'View all 28 qualified teams for the 2026 FIFA World Cup',
    url: 'https://worldcup26fanzone.com/teams',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qualified Teams - FIFA World Cup 2026',
    description: 'View all 28 qualified teams for the 2026 FIFA World Cup',
  },
};

export default function TeamsPage() {
  const qualifiedTeams = getQualifiedTeams().sort((a, b) => a.name.localeCompare(b.name));
  // const provisionalTeams = getProvisionalTeams().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              🏆 28 Qualified Teams
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Meet the teams who have secured their place in the 2026 FIFA World Cup across Canada, Mexico, and the United States
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">{qualifiedTeams.length}</div>
                <div className="text-sm text-blue-200">Qualified Teams</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">48</div>
                <div className="text-sm text-blue-200">Total Spots</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-4xl font-bold">{48 - qualifiedTeams.length}</div>
                <div className="text-sm text-blue-200">Still to Qualify</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Qualified Teams Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ✅ Qualified Teams
          </h2>
          <p className="text-gray-600">
            These {qualifiedTeams.length} teams have officially secured their place at the 2026 World Cup
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qualifiedTeams.map((team) => (
            <Link
              key={team.slug}
              href={`/teams/${team.slug}`}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500"
              style={{
                borderTopColor: team.primaryColor,
                borderTopWidth: '4px'
              }}
            >
              <div className="p-6">
                {/* Flag and Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-6xl" title={team.name}>
                    {team.flagEmoji}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      {team.confederation}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                      QUALIFIED
                    </span>
                  </div>
                </div>

                {/* Team Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {team.name}
                </h3>

                {/* Stats */}
                <div className="space-y-2 text-sm text-gray-600">
                  {team.fifaRanking && (
                    <div className="flex justify-between">
                      <span>FIFA Ranking:</span>
                      <span className="font-semibold">#{team.fifaRanking}</span>
                    </div>
                  )}
                  {team.appearances && (
                    <div className="flex justify-between">
                      <span>Appearances:</span>
                      <span className="font-semibold">{team.appearances}</span>
                    </div>
                  )}
                  {team.bestFinish && (
                    <div className="flex justify-between">
                      <span>Best Finish:</span>
                      <span className="font-semibold text-xs">{team.bestFinish}</span>
                    </div>
                  )}
                </div>

                {/* Hover Arrow */}
                <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  View Team Page
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Accent Line */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform"
                style={{ backgroundColor: team.secondaryColor }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Removed informational banner about group draw per request */}
    </div>
  );
}
