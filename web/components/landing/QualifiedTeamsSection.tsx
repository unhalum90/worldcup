
'use client';

import Link from 'next/link';
import { getQualifiedTeams } from '@/lib/teamsData';
import { useTranslations } from 'next-intl';

export default function QualifiedTeamsSection() {
  const qualifiedTeams = getQualifiedTeams();
  const t = useTranslations('qualifiedTeams');
  
  // Show a selection of teams (first 12 qualified)
  const featuredTeams = qualifiedTeams.slice(0, 12);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            🏆 {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t('subtitle', { count: qualifiedTeams.length })}
          </p>
          <div className="flex justify-center">
            <div className="bg-green-100 text-green-800 px-8 py-3 rounded-full font-bold text-lg">
              {t('counts', { count: qualifiedTeams.length })}
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
            className="inline-flex items-center gap-2 bg-blue-600 !text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
          >
            {t('viewAll', { count: qualifiedTeams.length })}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Info Banner removed per request */}
      </div>
    </section>
  );
}
