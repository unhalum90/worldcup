import Image from 'next/image';
import Link from 'next/link';
import MapEmbed from '@/components/MapEmbed';

type Props = { params: { city: string } };

const EDITOR_TEMPLATE = `# {{city_name}} — World Cup 2026 Fan Zone Guide

1. Overview
2. Getting There
3. Stadium Experience
4. Fan Meetups & Bars
5. Transportation & Parking
6. Safety & Local Laws
7. Things to Do
8. Fan Tips
9. Essential Links & Maps
`;

export default async function CityGuide({ params }: Props) {
  const { city: citySlug } = await params;

  // Server-side fetch for optional city metadata (hero_image, map_embed, name)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

  let city: any = null;
  if (base) {
    try {
      const res = await fetch(`${base}/rest/v1/cities?slug=eq.${encodeURIComponent(citySlug)}&select=*&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        cache: 'no-store',
      });
      const json = await res.json();
      city = Array.isArray(json) && json.length ? json[0] : null;
    } catch (e) {
      // ignore network / parsing errors and show placeholders
    }
  }

  const title = city?.name ? `${city.name} — City Guide` : `${citySlug} — City Guide`;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="mb-6">
          <Link href="/" className="text-sm text-[color:var(--color-primary)] hover:underline">← Back home</Link>
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          <p className="text-[color:var(--color-neutral-700)] mt-2">Practical travel tips, neighborhoods, transit, stadium access, and community recommendations.</p>
        </div>

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
          <main className="lg:col-span-2 space-y-8">

            {/* 1. Overview */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Overview</h2>
              <p className="text-[color:var(--color-neutral-800)]">Gillette Stadium (Foxborough) will host multiple World Cup 2026 matches. Foxborough is suburban — about an hour from downtown Boston without traffic — so lodging and transport choices strongly shape your matchday experience.</p>
              <p className="text-[color:var(--color-neutral-800)] mt-3">This guide distills practical, veteran-tested advice to help you plan lodging, choose the best travel mode, and avoid the worst of the post-event congestion.</p>
            </section>

            {/* 2. Getting There */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Getting There</h2>
              <h3 className="font-semibold mt-2">Airports</h3>
              <p className="text-[color:var(--color-neutral-800)]">Primary gateway: Boston Logan International (BOS). Alternatives: T.F. Green (PVD) in Providence and Bradley (BDL) near Hartford.</p>

              <h3 className="font-semibold mt-3">Public Transit</h3>
              <p className="text-[color:var(--color-neutral-800)]">For major events the MBTA often runs special event commuter rail service to Foxboro station. These trains (from South Station and Providence) are convenient but limited in capacity — buy round-trip tickets on the MBTA mTicket app as soon as they’re available.</p>

              <h3 className="font-semibold mt-3">Rideshare</h3>
              <p className="text-[color:var(--color-neutral-800)]">Designated pickup/dropoff is in Lot 15 (near Bass Pro Shops). Expect surge pricing and long waits after events; fares back to Boston have been reported in the $100–$150 range on busy nights.</p>

              <h3 className="font-semibold mt-3">Parking</h3>
              <p className="text-[color:var(--color-neutral-800)]">On-site lots are convenient to the stadium but suffer severe post-event congestion. Private off-site lots (cash, $40–$60) located about a mile away offer a faster escape in exchange for a short walk. Prepaid stadium-side parking typically costs around $50 and must be purchased in advance; delayed-exit lots are occasionally offered for selected events.</p>

              <h3 className="font-semibold mt-3">Average Costs</h3>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li>Commuter rail round-trip: ~ $20 (mTicket)</li>
                <li>Prepaid stadium parking: ~ $50</li>
                <li>Private cash lots: $40–$60</li>
                <li>Rideshare to Boston (surge): $100+</li>
              </ul>
            </section>

            {/* 3. Stadium Experience */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Stadium Experience</h2>
              <dl className="text-[color:var(--color-neutral-800)]">
                <div className="flex justify-between py-1"><dt className="font-medium">Stadium Name</dt><dd>Gillette Stadium (Foxborough)</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Capacity</dt><dd>~ 65k (approx.)</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Getting There</dt><dd>Event trains, driving, private lots, and shuttles (see Transport section)</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Gates & Security</dt><dd>Expect screening and bag checks; follow stadium policies.</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Accessibility</dt><dd>ADA seating and services are available; contact the stadium in advance for special arrangements.</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Food & Drink</dt><dd>Patriot Place and the stadium offer many dining options; most concessions are cashless and support mobile ordering.</dd></div>
              </dl>
            </section>

            {/* 4. Fan Meetups & Bars */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Fan Meetups & Bars</h2>
              <p className="text-[color:var(--color-neutral-800)]">Pre- and post-match meetups are common at Patriot Place. For downtown meetups and supporter clubs, look to Back Bay, the North End, and Fenway. We'll add nationality-specific meetup guides as the community contributes.</p>
              <table className="w-full mt-4 text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b"><th className="pb-2">Nation</th><th className="pb-2">Bar / Area</th><th className="pb-2">Notes</th></tr>
                </thead>
                <tbody>
                  <tr className="align-top border-b"><td className="py-2">General</td><td className="py-2">Patriot Place / Back Bay / Fenway</td><td className="py-2">Good starting points for supporter meetups.</td></tr>
                </tbody>
              </table>
            </section>

            {/* 5. Transportation & Parking (locals' tips) */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Transportation & Parking</h2>
              <p className="text-[color:var(--color-neutral-800)]">Local veterans recommend one of three strategies: park off-site and walk to avoid the worst post-event jams; leave slightly early to beat the initial surge; or plan to linger at a tailgate or Patriot Place for 45–90 minutes until traffic eases.</p>
              <h3 className="font-semibold mt-3">Tips</h3>
              <ol className="list-decimal pl-5 text-[color:var(--color-neutral-800)]">
                <li>Park 0.5–1 mile away in private lots ($40–$60) and walk — best tradeoff between time and cost.</li>
                <li>Buy prepaid stadium-side parking only if you need immediate proximity — passes sell out and can be pricey.</li>
                <li>Consider organized shuttles or Rally Bus services as an alternative to strict train schedules.</li>
              </ol>
            </section>

            {/* 6. Safety & Local Laws */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Safety & Local Laws</h2>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li>Keep valuables secure in crowded areas.</li>
                <li>Respect stadium rules and code of conduct; violations can lead to ejection.</li>
                <li>Watch for transit alerts and service changes on matchday.</li>
              </ul>
            </section>

            {/* 7. Things to Do */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Things to Do</h2>
              <p className="text-[color:var(--color-neutral-800)]">Spend extra time at Patriot Place (shopping, restaurants, Patriots Hall of Fame). For more tourist activities, downtown Boston offers historic sites, nightlife, and dining options.</p>
            </section>

            {/* 8. Fan Tips */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Fan Tips</h2>
              <ol className="list-decimal pl-5 text-[color:var(--color-neutral-800)]">
                <li>Plan your transport early and commit to a strategy.</li>
                <li>Buy event train tickets as soon as they are available if you plan to ride the commuter rail.</li>
                <li>For driving, have an exit strategy (private lot, leave early, or wait it out).</li>
                <li>Arrive early to enjoy Patriot Place and reduce stress.</li>
              </ol>
            </section>

            {/* 9. Essential Links & Maps */}
            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-2xl font-bold mb-3">Essential Links & Maps</h2>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li><a className="text-[color:var(--color-primary)] hover:underline" href="https://www.patriots.com/gillette-stadium">Gillette Stadium official site</a></li>
                <li><a className="text-[color:var(--color-primary)] hover:underline" href="https://www.mbta.com">MBTA / event train info (mTicket)</a></li>
                <li><a className="text-[color:var(--color-primary)] hover:underline" href="https://www.google.com/maps/place/Gillette+Stadium">Google Maps – Gillette Stadium</a></li>
              </ul>
              <p className="text-[color:var(--color-neutral-700)] mt-3">Use the sidebar map or add a Google My Maps link to the city metadata for stadium & parking overlays.</p>
            </section>

            <section className="rounded-lg p-6 bg-[color:var(--color-neutral-50)] border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-lg font-bold mb-2">Editor template</h3>
              <p className="text-[color:var(--color-neutral-800)]">Copy this structure for new city guides.</p>
              <pre className="mt-3 p-3 bg-white rounded text-sm overflow-auto border border-[color:var(--color-neutral-100)]"><code>{EDITOR_TEMPLATE}</code></pre>
            </section>

          </main>

          <aside className="space-y-6">
            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="font-bold mb-2">At a glance</h3>
              <dl className="text-sm text-[color:var(--color-neutral-800)]">
                <div className="flex justify-between py-1"><dt className="font-medium">Airport</dt><dd>Logan Airport (BOS)</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Transit</dt><dd>MBTA (subway, bus, commuter rail)</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Currency</dt><dd>USD</dd></div>
                <div className="flex justify-between py-1"><dt className="font-medium">Language</dt><dd>English</dd></div>
              </dl>
            </div>

            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="font-bold mb-2">Map</h3>
              {city?.map_embed ? (
                <MapEmbed src={city.map_embed} title={`${city?.name || citySlug} map`} height={240} />
              ) : (
                <div className="w-full h-48 bg-[color:var(--color-neutral-50)] rounded-md flex items-center justify-center text-sm text-[color:var(--color-neutral-600)]">Map placeholder (embed Google My Maps / Mapbox)</div>
              )}
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

            <div className="rounded-lg p-4 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="font-bold mb-2">Safety & Tips</h3>
              <ul className="text-sm list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li>Keep an eye on belongings in crowded areas.</li>
                <li>Check transit alerts on matchday for planned service changes.</li>
                <li>Follow venue rules for bag sizes and prohibited items.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

