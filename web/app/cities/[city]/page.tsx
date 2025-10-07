import Image from 'next/image';
import Link from 'next/link';
import MapEmbed from '@/components/MapEmbed';

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
              <p className="text-[color:var(--color-neutral-800)]">Gillette Stadium (marketed as “Boston Stadium” for FIFA) sits in Foxborough ~22 miles southwest of downtown. It will host seven matches in 2026. Because the venue is suburban, plan travel carefully: decide between staying on-site for convenience or in downtown Boston for the city experience and take event trains on matchday.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Getting to and from the stadium</h2>

              <h3 className="font-semibold mt-2">Public transport — special event trains</h3>
              <p className="text-[color:var(--color-neutral-800)]">The recommended approach to avoid Route 1 traffic is the MBTA’s Foxboro Event Service: direct, special trains from Boston South Station and Providence to Foxboro station. These trains are separate from regular commuter service and usually require a special round‑trip ticket purchased in advance (often via the MBTA mTicket app).</p>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li><strong>Schedule:</strong> Trains typically arrive ~90 minutes before kickoff and depart ~30 minutes after the final whistle — plan accordingly.</li>
                <li><strong>Walk:</strong> Foxboro station is about an eight‑minute walk to the stadium via marked pedestrian paths.</li>
                <li><strong>Capacity & upgrades:</strong> MBTA has planned platform upgrades to allow faster boarding during major events; tickets sell out quickly.</li>
                <li><strong>Other rail:</strong> On non‑event days, Foxboro sees limited commuter‑rail service. Use Franklin Line stops (Walpole/Norwood) plus taxi/rideshare for off‑day visits.</li>
              </ul>

              <h3 className="font-semibold mt-4">Driving & parking</h3>
              <p className="text-[color:var(--color-neutral-800)]">Route 1 is the primary road to Gillette Stadium and can be heavily congested. If driving, arrive early and secure parking in advance when possible.</p>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li><strong>Free general parking:</strong> Often available across Route 1 and included with some tickets; pedestrian bridges/tunnels provide access.</li>
                <li><strong>Stadium‑side paid parking:</strong> Prepaid passes (~US$35–50) can be bought via Ticketmaster; limited availability.</li>
                <li><strong>ADA parking:</strong> Accessible spaces are on the stadium side and fill quickly—plan to arrive when lots open.</li>
                <li><strong>Oversize & RVs:</strong> Park in designated lots (e.g., Lot 52) and follow tailgating rules; overnight parking is typically prohibited.</li>
                <li><strong>Offsite options:</strong> Private lots and nearby hotels sometimes offer parking to avoid Route 1 congestion — expect a 10–30 minute walk from remote lots.</li>
              </ul>

              <h3 className="font-semibold mt-4">Rideshare, taxis & shuttles</h3>
              <p className="text-[color:var(--color-neutral-800)]">Rideshare drop‑off/pick‑up typically runs from Lot 15 (near the CVS Health Gate). Lines can be long after the match; consider walking to nearby neighborhoods (Walpole) to find a faster pickup. Some hotels and coach services run shuttle buses on match days.</p>

              <h3 className="font-semibold mt-4">Air travel & regional airports</h3>
              <p className="text-[color:var(--color-neutral-800)]">Boston Logan International (BOS) is the main gateway. From Logan, take the MBTA Blue Line + transfers or the Silver Line to South Station to connect to event trains. T.F. Green (PVD) and Bradley (BDL) are alternatives depending on fares.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Accommodation options</h2>
              <p className="text-[color:var(--color-neutral-800)]">Staying at Patriot Place hotels eliminates most transport headaches. On‑site options and nearby hotels range from convenient to budget‑friendly; downtown Boston gives you more dining and nightlife but requires catching event trains to Foxboro.</p>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li><strong>On‑site:</strong> Renaissance Boston Patriot Place; Hilton Garden Inn Foxborough/Patriot Place — highly convenient but sell out fast.</li>
                <li><strong>Nearby:</strong> Fairfield Inn (Walpole), Courtyard by Marriott (Norwood/Canton), Home2 Suites (Franklin), SpringHill Suites (Wrentham).</li>
                <li><strong>Downtown Boston:</strong> Club Quarters (Faneuil Hall), InterContinental, The Langham — choose these if you want to explore the city pre/post match.</li>
              </ul>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Stadium policies & guest services</h2>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li><strong>Mobile‑only entry:</strong> The stadium is cashless and mobile‑ticket only — use the Gillette Stadium or FIFA app for entry.</li>
                <li><strong>Security screening:</strong> Evolv Express weapon‑detection systems are used; all guests consent to search and must follow the code of conduct.</li>
                <li><strong>Bag policy:</strong> Only clear bags (up to 12 × 12 × 6 in), one‑gallon freezer bags, or small wristlets are allowed. Exceptions for medical needs must be requested in advance.</li>
                <li><strong>Cashless concessions:</strong> No ATMs inside; use cards or mobile pay. Cash‑to‑card kiosks are usually available near the ticket office.</li>
                <li><strong>Accessible services:</strong> Accessible seating and ADA facilities are provided; contact the stadium ADA hotline for assistance.</li>
              </ul>
              <p className="text-[color:var(--color-neutral-700)] mt-3">Concessions include The Ale House, Backyard Barbeque, The Beacon, and craft beer bars near the lighthouse. Many stands support mobile ordering and contactless pickup.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">Fan tips & tricks</h2>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)]">
                <li><strong>Buy early:</strong> Event train tickets and match tickets sell out quickly — secure them as soon as sales open.</li>
                <li><strong>Essential apps:</strong> MBTA mTicket, Gillette Stadium/FIFA app for match tickets, and ride‑share apps (Uber/Lyft).</li>
                <li><strong>Dress & packing:</strong> Prepare for variable New England weather — layers, a poncho, sunscreen, and comfortable shoes.</li>
                <li><strong>Clear bag & belongings:</strong> Carry only permitted items and small essentials to speed entry.</li>
                <li><strong>Tailgating:</strong> Permitted four hours before kickoff with rules (no kegs, contained grills). Patriot Place offers pre‑match food and shopping.</li>
              </ul>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h2 className="text-xl font-bold mb-2">After the match</h2>
              <p className="text-[color:var(--color-neutral-800)]">Expect delays. Trains and roads will be busy; patience is required. Many drivers use the paid‑to‑park program to wait out traffic. For assistance, text 50894 with location or email customerservice@gillettestadium.com.</p>
              <p className="text-[color:var(--color-neutral-700)] mt-3">Final thought: with planning — pick your lodging, book trains or parking early, and note the clear‑bag and cashless policies — you’ll focus on the match and have a great day.</p>
            </section>
          </main>

          {/* Sidebar */}
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
              {/* Use MapEmbed if the city metadata provides an embed URL (e.g., Google My Maps) */}
              {/* MapEmbed is a client component that lazy-loads the iframe for performance */}
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
