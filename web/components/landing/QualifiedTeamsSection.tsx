'use client';

import Link from 'next/link';
import { getQualifiedTeams } from '@/lib/teamsData';

export default function QualifiedTeamsSection() {
  const qualifiedTeams = getQualifiedTeams();
  
  // Show a selection of teams (first 12 qualified)
  const featuredTeams = qualifiedTeams.slice(0, 12);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            🏆 Qualified Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {qualifiedTeams.length} teams have officially booked their place at the 2026 World Cup
          </p>
          <div className="flex justify-center">
            <div className="bg-green-100 text-green-800 px-8 py-3 rounded-full font-bold text-lg">
              {qualifiedTeams.length} Qualified Teams
            </div>
          </div>
        </div>

        {/* Featured Teams Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {featuredTeams.map((team) => (
            <Link
              key={team.slug}
              href={`/teams/${team.slug}`}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 text-center border-2 border-transparent hover:border-blue-500"
              style={{ borderTopColor: team.primaryColor, borderTopWidth: '3px' }}
            >
              <div className="text-5xl mb-2 transform group-hover:scale-110 transition-transform">
                {team.flagEmoji}
              </div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {team.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {team.confederation}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
          >
            View All {qualifiedTeams.length} Teams
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-900 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">
            📅 Group Draw: December 5, 2025
          </h3>
          <p className="text-blue-100">
            Follow your favorite team's journey to North America and get notified when fixtures are announced
          </p>
        </div>
      </div>
    </section>
  );
}
