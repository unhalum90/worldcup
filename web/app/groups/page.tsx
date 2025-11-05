"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { groups } from "@/data/groups";
import { venues } from "@/data/venues";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const methodology = [
  "This analysis evaluates all 12 groups across five fan-relevant factors: total distance, stadium transit access, climate zones, complexity, and unique cities.",
  "Each data point is derived from verified venue logistics and geographic mapping across all 16 host cities in Canada, Mexico, and the United States.",
];

const complexityLabel = (rating: number) => {
  if (rating <= 2) return "Low complexity";
  if (rating === 3) return "Moderate complexity";
  if (rating === 4) return "High complexity";
  return "Extreme complexity";
};

const allVenuePoints = venues.map((venue) => ({
  city: venue.city,
  stadium: venue.stadium,
  lat: venue.lat,
  lng: venue.lng,
}));

const GroupsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <header className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Groups hub</p>
          <h1 className="text-4xl font-extrabold text-neutral-900 sm:text-5xl">
            World Cup 2026 Group Stage Analysis
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-neutral-600">
            Compare all 12 groups with quick stats, transit ratings, and climate context before you commit to a travel plan.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900">Methodology</h2>
          <div className="mt-4 space-y-4 text-neutral-600">
            {methodology.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Host city map</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Sixteen host cities across North America power every group. Zoom and tap to preview stadium locations.
            </p>
            <div className="mt-4">
              <Map points={allVenuePoints} height={420} />
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Key takeaways</h2>
            <ul className="mt-4 space-y-3 text-neutral-600">
              <li>Group I is the shortest loop at just 1,161 miles and only one border crossing.</li>
              <li>Group J is the toughest itinerary with 6,424 miles and zero rail-friendly stadiums.</li>
              <li>Transit gaps cluster around Dallas, Kansas City, Miami, Los Angeles, and Guadalajara.</li>
              <li>Climate swings matter: coastal fog in San Francisco vs. triple-digit heat in Texas and Mexico.</li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-blue-100 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
            <h3 className="text-3xl font-semibold text-neutral-900">Plan Your World Cup Journey</h3>
            <p className="mt-3 text-neutral-600">
              Download our premium city guides or create a custom itinerary with the AI Trip Builder.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/guides"
                className="inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
              >
                Download city guides
              </Link>
              <Link
                href="/planner/trip-builder"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500"
              >
                Plan your trip with the AI Trip Builder
              </Link>
            </div>

            <p className="mt-6 text-sm text-neutral-500">
              Get detailed analysis for each group below.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Group breakdown</h2>
          <div className="mt-6 rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const summarySentence = group.summary.split(".")[0] + ".";
                return (
                  <div
                    key={group.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-blue-100/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                            Group {group.id}
                          </p>
                          <h3 className="mt-1 text-xl font-bold text-neutral-900">{group.title}</h3>
                        </div>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                          {complexityLabel(group.complexity_rating)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">{summarySentence}</p>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-neutral-500">Distance</dt>
                          <dd className="text-neutral-900 font-semibold">
                            {group.total_distance_miles.toLocaleString()} mi
                          </dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Cities</dt>
                          <dd className="text-neutral-900 font-semibold">{group.unique_cities}</dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Border crossings</dt>
                          <dd className="text-neutral-900 font-semibold">{group.border_crossings}</dd>
                        </div>
                        <div>
                          <dt className="text-neutral-500">Countries</dt>
                          <dd className="text-neutral-900 font-semibold">{group.countries.join(", ")}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="mt-6">
                      <Link
                        href={`/groups/${group.id.toLowerCase()}`}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                      >
                        View full analysis
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GroupsPage;
