import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

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

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Host City Forums</h1>
        <p className="text-gray-600 text-lg">
          Connect with fellow fans in all 16 host cities for the 2026 FIFA World Cup
        </p>
      </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cities?.map((c: any) => {
              const palette = ['#3CAC3B', '#2A398D', '#E61D25', '#D1D4D1', '#474A4A'];
              const idx = Math.abs(Array.from(String(c.slug)).reduce((a: number, ch: string) => a + ch.charCodeAt(0), 0)) % palette.length;
              const accent = palette[idx];
              // use consistent dark text for legibility (no white text)
              const textColor = '#0f172a';
              const cardBg = accent + '20';
              return (
                <Link key={c.id} href={`/forums/${c.slug}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg shadow-sm" style={{ backgroundColor: cardBg, color: textColor, border: `2px solid ${accent}` }}>
                    <div className="text-2xl">{getCityFlag(c.country)}</div>
                    <div>
                      <h3 className="text-base font-semibold leading-tight" style={{ color: textColor }}>
                        {c.name}, <span className="text-base font-semibold" style={{ color: textColor }}>{c.country}</span>
                      </h3>
                    </div>
                    <div className="ml-auto text-sm text-blue-600">→</div>
                  </div>
                </Link>
              );
            })}
          </div>

      {(!cities || cities.length === 0) && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">⚽</div>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No cities found</h3>
          <p className="text-gray-400">Run the database setup to populate the host cities.</p>
        </div>
      )}
    </div>
  );
}
