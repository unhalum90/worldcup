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
              <h2 className="text-2xl font-bold mb-3">Your First Trip to Gillette Stadium: A Stress-Free Guide</h2>
              <p className="text-[color:var(--color-neutral-800)]">So, you've got tickets to Gillette Stadium (marketed as "Boston Stadium" for FIFA). Foxborough is suburban — about 22 miles (35 km) from downtown — so planning is everything. This guide collects crowd-sourced, practical advice to help you choose lodging, transportation, and a matchday plan that fits your budget and tolerance for post-event congestion.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-xl font-bold mb-2">1. Where to stay — Your home base decision</h3>
              <p className="text-[color:var(--color-neutral-800)]">Your choice of lodging has the biggest impact on logistics. Three common options:</p>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li><strong>On-site (Patriot Place)</strong> — Unbeatable convenience; walk back to your room after the event. Cons: expensive on event nights.</li>
                <li><strong>Downtown Boston</strong> — Great if you want to explore the city before/after the match; expect a ~1 hour journey without traffic.</li>
                <li><strong>Providence, RI</strong> — Often cheaper and closer than Boston; a solid mid-point that many visitors prefer.</li>
              </ul>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-xl font-bold mb-2">2. Getting to the stadium — Choosing your ride</h3>
              <p className="text-[color:var(--color-neutral-800)]">Decide between driving or taking the special event rail. Both are valid but have trade-offs; read the details to pick the right plan.</p>

              <h4 className="font-semibold mt-3">Driving — control and tailgating, but expect exit jams</h4>
              <p className="text-[color:var(--color-neutral-800)]">Driving gives flexibility and tailgating options, but post-event traffic is infamous. Typical reports include multi-hour waits to exit official lots. Proven strategies:</p>
              <ol className="list-decimal pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li><strong>Park smart & walk:</strong> Private cash lots ~1 mile away let you avoid stadium jam in exchange for a 15–20 minute walk.</li>
                <li><strong>Leave early:</strong> Exit 15–20 minutes before the end to avoid the initial surge.</li>
                <li><strong>Wait it out:</strong> Tailgate an extra hour; many fans prefer to relax and leave once traffic eases.</li>
              </ol>

              <h4 className="font-semibold mt-3">Parking lot intel</h4>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li>Free general parking: across Route 1 — heavy post-event delays.</li>
                <li>Prepaid stadium-side parking: limited and expensive; buy early.</li>
                <li>Delayed-exit lots: agree to wait 75–90 minutes, receive a gift card incentive.</li>
                <li>Private lots: cash lots run by local businesses/residents for faster exits.</li>
              </ul>

              <h4 className="font-semibold mt-3">2.2 Riding the rails — event trains</h4>
              <p className="text-[color:var(--color-neutral-800)]">MBTA runs special Foxboro Event Service trains from South Station and Providence to Foxboro station. These are typically the best way to bypass road traffic but have strict schedules and limited seats.</p>
              <ul className="list-disc pl-5 text-[color:var(--color-neutral-800)] mt-3">
                <li>Round-trip tickets (~$20) sell out quickly; buy on the MBTA mTicket app.</li>
                <li>Trains usually arrive ~90 minutes before kickoff and depart ~30 minutes after the event; missed trains can leave you scrambling.</li>
                <li>Foxboro station is ~8 minutes' walk to Gillette via marked pedestrian paths.</li>
                <li>Rally Buses/private coaches are alternative options that often wait longer than the trains' tight windows.</li>
              </ul>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-xl font-bold mb-2">3. Uber/Lyft & taxis</h3>
              <p className="text-[color:var(--color-neutral-800)]">Designated rideshare pickup is Lot 15. Beware surge pricing after events — fares back to Boston can be very high. If you choose rideshare, consider walking to nearby neighborhoods for faster pickup.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-xl font-bold mb-2">4. Pre-event guide to Patriot Place</h3>
              <p className="text-[color:var(--color-neutral-800)]">Arrive early and explore Patriot Place: restaurants, Patriots Hall of Fame, bowling, cinema, and shopping. It’s the easiest way to fill hours before gates open.</p>
            </section>

            <section className="rounded-lg p-6 bg-white border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-xl font-bold mb-2">5. Final checklist</h3>
              <ol className="list-decimal pl-5 text-[color:var(--color-neutral-800)]">
                <li>Plan your transport (drive, train, or shuttle) before you arrive.</li>
                <li>Buy event train tickets immediately when available.</li>
                <li>If driving, pick a private lot or have an exit plan.</li>
                <li>Arrive early — enjoy Patriot Place and tailgating rules.</li>
              </ol>
            </section>

            <section className="rounded-lg p-6 bg-[color:var(--color-neutral-50)] border border-[color:var(--color-neutral-100)] shadow-sm">
              <h3 className="text-lg font-bold mb-2">Core template architecture (for editors)</h3>
              <p className="text-[color:var(--color-neutral-800)]">Below is the canonical structure we use for each city guide. Editors can follow this template when creating new city pages.</p>
              <pre className="mt-3 p-3 bg-white rounded text-sm overflow-auto border border-[color:var(--color-neutral-100)]"><code>
# {{city_name}} — World Cup 2026 Fan Zone Guide

## 1. Overview
Quick context about {{city_name}}, main vibe, and what to expect for matchdays.

## 2. Getting There
- Airports: {{airport_primary}} ({{airport_code}}) — {{distance}} km from city center
- Public Transit:
- Rideshare:
- Parking:
- Average Costs:

## 3. Stadium Experience
- Stadium Name: {{stadium_name}}
- Capacity: {{stadium_capacity}}
- Getting There: 
- Gates & Security:
- Accessibility:
- Food & Drink Highlights:

## 4. Fan Meetups & Bars
Top local spots by fan nationality:
| Nation | Bar/Area | Notes |

## 5. Transportation & Parking
Best routes, parking tips, exit strategies, and “what locals know.”

## 6. Safety & Local Laws
Neighborhood do’s/don’ts, alcohol laws, crowd control notes.

## 7. Things to Do
Short activities within 1 hour.

## 8. Fan Tips
Bullet list of verified crowd-sourced advice.

## 9. Essential Links & Maps
- [Official City Page]({{city_official_url}})
- [Transit Map]({{transit_pdf_link}})
- [Google Maps Stadium]({{gmap_link}})

_Last updated May 2026_
</code></pre>
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
