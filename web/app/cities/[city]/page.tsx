import Image from 'next/image';
import Link from 'next/link';

type Props = { params: { city: string } };

export default async function CityGuide({ params }: Props) {
  const citySlug = (await params).city;

  // Server-side fetch for city metadata (name, country, hero image) if available
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?slug=eq.${citySlug}&select=*&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    cache: 'no-store',
  });
  const cities = await res.json();
  const city = Array.isArray(cities) && cities.length ? cities[0] : null;

  const title = city?.name ? `${city.name} — City Guide` : `${citySlug} — City Guide`;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="mb-6">
          <Link href="/" className="text-sm text-[color:var(--color-primary)] hover:underline">← Back home</Link>
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          <p className="text-[color:var(--color-neutral-700)] mt-2">Practical travel tips, neighborhoods, transit, stadium access, and community recommendations.</p>
        </div>

        {/* Hero / gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-[var(--radius-lg)] overflow-hidden border border-[color:var(--color-neutral-100)] shadow-lg">
            <Image
              src={city?.hero_image || '/mockups/desktop_mockup_city_guide.png'}
              alt={`${city?.name || citySlug} hero`}
              width={1200}
              height={600}
              className="w-full h-[360px] object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-[color:var(--color-neutral-100)] shadow-sm h-[176px] flex items-center justify-center bg-[color:var(--color-neutral-50)]">
              <span className="text-sm text-[color:var(--color-neutral-600)]">Photo placeholder</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-[color:var(--color-neutral-100)] shadow-sm h-[176px] flex items-center justify-center bg-[color:var(--color-neutral-50)]">
              <span className="text-sm text-[color:var(--color-neutral-600)]">Photo placeholder</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <main className="lg:col-span-2 space-y-8">
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Overview</h2>
              <p className="text-[color:var(--color-neutral-800)]">This starter city guide is a wireframe based on our feature spec. Add neighborhood notes, transit guidance, stadium ingress/egress tips, and verified local recommendations here.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Top Neighborhoods</h2>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li>Neighborhood A — quick notes and why fans like it.</li>
                <li>Neighborhood B — transit options and food highlights.</li>
                <li>Neighborhood C — nightlife and meetup spots.</li>
              </ul>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Stadium Access & Matchday</h2>
              <p className="text-[color:var(--color-neutral-800)]">Tips for getting to the stadium, recommended arrival windows, entrances to use, and local fan zones.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Where to Eat</h2>
              <p className="text-[color:var(--color-neutral-800)]">Curated list of restaurants and bars popular with fans. Add brief notes and price ranges.</p>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="font-bold mb-2">Map</h3>
              {/* Map placeholder: swap with an embedded map or static image later */}
              <div className="w-full h-48 bg-[color:var(--color-neutral-50)] rounded-md flex items-center justify-center text-sm text-[color:var(--color-neutral-600)]">Map placeholder (embed Google Maps / Mapbox)</div>
            </div>

            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="font-bold mb-2">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/forums/${citySlug}`} className="text-[color:var(--color-primary)] hover:underline">City forum</Link></li>
                <li><Link href="/travel-builder" className="text-[color:var(--color-primary)] hover:underline">AI Travel Builder</Link></li>
                <li><a href="#" className="text-[color:var(--color-primary)] hover:underline">Transport schedules</a></li>
              </ul>
            </div>

            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm text-center">
              <h3 className="font-bold mb-2">Contribute</h3>
              <p className="text-sm text-[color:var(--color-neutral-700)] mb-3">Share a tip, add a photo, or suggest a correction.</p>
              <Link href={`/forums/${citySlug}`} className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[color:var(--color-accent-red)] text-white font-semibold">Go to forum</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
