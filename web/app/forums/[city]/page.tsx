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

  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg,#f6faf9,#f3f7fb)' }}>
      <div className="container">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/forums" className="text-sm text-blue-600 hover:underline">← Back to all forums</Link>
              <h1 className="text-3xl font-bold mt-2">{city?.name || citySlug} Forum</h1>
              <p className="text-[color:var(--color-neutral-700)] mt-2">Community discussions and local tips</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-xl shadow-md p-6">
          {/* Client component enforces auth and fetches threads */}
          <ThreadsListClient cityId={city?.id} citySlug={citySlug} />
        </div>
      </div>
    </div>
  );
}
