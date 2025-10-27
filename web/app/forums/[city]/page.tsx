import Link from 'next/link';
import ThreadCard from '@/components/ThreadCard';
import ThreadsListClient from '@/components/forums/ThreadsListClient';

type Props = {
  params: { city: string };
};

export default async function CityForum({ params }: Props) {
  // `params` is a Promise-like object in newer Next.js versions — await it before using.
  const citySlug = (await params).city;

  // Server-side fetch for city metadata only (safe)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?slug=eq.${citySlug}&select=*&limit=1`, {
    headers: { 
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    cache: 'no-store',
  });
  const cities = await res.json();
  const city = Array.isArray(cities) && cities.length ? cities[0] : null;

  // City-specific intro copy overrides
  const introBySlug: Record<string, string> = {
    'boston': 'Local transit, neighborhoods, matchday logistics, and meetups for fans visiting Boston and Foxborough.',
  };
  const introDefault = `Tips, transit, matchday logistics, and meetups for fans traveling to ${city?.name || citySlug}.`;
  const introCopy = introBySlug[citySlug] ?? introDefault;

  // Helper: related forums by geography (lightweight map; expand as needed)
  const relatedBySlug: Record<string, { slug: string; name: string }[]> = {
    'boston': [
      { slug: 'new-york', name: 'New York' },
      { slug: 'philadelphia', name: 'Philadelphia' },
      { slug: 'toronto', name: 'Toronto' },
    ],
    'new-york': [
      { slug: 'boston', name: 'Boston' },
      { slug: 'philadelphia', name: 'Philadelphia' },
      { slug: 'toronto', name: 'Toronto' },
    ],
    'philadelphia': [
      { slug: 'new-york', name: 'New York' },
      { slug: 'boston', name: 'Boston' },
      { slug: 'washington-dc', name: 'Washington DC' },
    ],
  };
  const related = relatedBySlug[citySlug] ?? [];

  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg,#f6faf9,#f3f7fb)' }}>
      <div className="container">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/forums" className="text-sm text-blue-600 hover:underline">← Back to all forums</Link>
              <h1 className="text-3xl font-bold mt-2">{city?.name || citySlug} Forum</h1>
              <p className="text-[color:var(--color-neutral-700)] mt-2">{introCopy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-xl shadow-md p-6">
          {/* Client component enforces auth and fetches threads */}
          <ThreadsListClient cityId={city?.id} citySlug={citySlug} />
        </div>

        {/* Related forums */}
        {related.length > 0 && (
          <div className="mt-8 text-sm text-gray-700">
            <span className="mr-2">🔗 Related forums:</span>
            {related.map((r, idx) => (
              <span key={r.slug}>
                <Link href={`/forums/${r.slug}`} className="text-blue-600 hover:underline">{r.name}</Link>
                {idx < related.length - 1 ? <span> • </span> : null}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
