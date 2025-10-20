import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host City Forums | WC26 Fan Zone',
  description: 'Connect with World Cup 2026 fans across all 16 host cities. Share tips, organize meetups, and join discussions about the biggest tournament in football.',
  keywords: ['World Cup forums', 'fan community', 'host cities', '2026 FIFA', 'football fans'],
};

export const revalidate = 0;

export default async function ForumsIndex() {
  // Fetch list of cities for forums
  const { data: cities, error } = await supabase.from('cities').select('id,name,slug,country').order('name');

  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Host City Forums</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading cities. Please run the database setup first.</p>
          <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  const getCityFlag = (country: string) => {
    switch (country) {
      case 'US': return '🇺🇸'
      case 'CA': return '🇨🇦'
      case 'MX': return '🇲🇽'
      default: return '🌍'
    }
  }

  const trendingTopics = [
    { title: 'Best Fan Zones and Watch Parties', replies: 127, views: 3401 },
    { title: 'Travel Tips: Getting Between Cities', replies: 89, views: 2156 },
    { title: 'Group Stage Match Predictions', replies: 213, views: 5672 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[color:var(--color-primary)] to-blue-600 bg-clip-text text-transparent">
            Host City Forums
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with fellow fans in all 16 host cities. Share tips, organize meetups, and build the ultimate World Cup 2026 community.
          </p>
        </div>

        {/* Trending Topics Section */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold">Trending Discussions</h2>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <span className="font-semibold text-gray-800">{topic.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{topic.replies} replies</span>
                  <span className="hidden sm:inline">{topic.views.toLocaleString()} views</span>
                  <span className="text-blue-600">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City Forums Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏙️</span>
            <h2 className="text-2xl font-bold">City Forums</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities?.map((c: any) => {
              const palette = ['#3CAC3B', '#2A398D', '#E61D25', '#D1D4D1', '#474A4A'];
              const idx = Math.abs(Array.from(String(c.slug)).reduce((a: number, ch: string) => a + ch.charCodeAt(0), 0)) % palette.length;
              const accent = palette[idx];
              
              return (
                <Link key={c.id} href={`/forums/${c.slug}`} className="group">
                  <div 
                    className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-32 flex flex-col justify-between p-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${accent}20 0%, ${accent}40 100%)`,
                      border: `2px solid ${accent}60`
                    }}
                  >
                    {/* City Flag/Icon */}
                    <div className="absolute top-2 right-2 text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
                      {getCityFlag(c.country)}
                    </div>
                    
                    {/* City Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {c.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {c.country === 'US' ? 'United States' : c.country === 'CA' ? 'Canada' : 'Mexico'}
                      </p>
                    </div>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      <span>Join Discussion</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {(!cities || cities.length === 0) && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">⚽</div>
            <h3 className="text-xl font-medium text-gray-500 mb-2">No cities found</h3>
            <p className="text-gray-400">Run the database setup to populate the host cities.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Can't Find Your Topic?</h2>
          <p className="text-lg mb-6 opacity-90">Start a new discussion and connect with thousands of fans</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
            Create New Post
          </button>
        </div>
      </div>
    </div>
  );
}
