"use client";

import Link from "next/link";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/components/Map";
import type { GroupData } from "@/data/groups";
import { venues } from "@/data/venues";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface GroupTemplateProps {
  data: GroupData;
}

const ratingConfig = {
  excellent: {
    label: "Excellent access",
    badge: "bg-green-100 text-green-800",
  },
  partial: {
    label: "Partial access",
    badge: "bg-amber-100 text-amber-800",
  },
  none: {
    label: "No rail access",
    badge: "bg-red-100 text-red-800",
  },
} as const;

const complexityLabel = (rating: number) => {
  if (rating <= 2) return "Low complexity";
  if (rating === 3) return "Moderate complexity";
  if (rating === 4) return "High complexity";
  return "Extreme complexity";
};

const GroupTemplate = ({ data }: GroupTemplateProps) => {
  const cityNames = useMemo(
    () => data.stadium_access.map((stadium) => stadium.city),
    [data.stadium_access]
  );

  const mapPoints: MapPoint[] = useMemo(() => {
    const fromOverride =
      data.map_coords?.map((coord) => {
        const stadium = data.stadium_access.find((item) => item.city === coord.city);
        return {
          city: coord.city,
          stadium: stadium?.stadium ?? coord.city,
          lat: coord.lat,
          lng: coord.lng,
          rating: stadium?.rating,
          notes: stadium?.notes,
        };
      }) ?? [];

    if (fromOverride.length) {
      return fromOverride;
    }

    return venues
      .filter((venue) => cityNames.includes(venue.city))
      .map((venue) => {
        const stadium = data.stadium_access.find((item) => item.city === venue.city);
        return {
          city: venue.city,
          stadium: venue.stadium,
          lat: venue.lat,
          lng: venue.lng,
          rating: stadium?.rating,
          notes: stadium?.notes,
        };
      });
  }, [cityNames, data.map_coords, data.stadium_access]);

  const teamLink = `/teams?group=${data.id}`;

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-10 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-200">Group {data.id}</p>
            <h1 className="text-4xl font-extrabold md:text-5xl">{data.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-blue-100">{data.summary}</p>
          </div>
          <div className="grid gap-3 rounded-2xl bg-white/10 p-6 text-sm text-blue-50">
            <div className="flex items-center justify-between gap-6">
              <span>Total distance</span>
              <span className="text-xl font-semibold">{data.total_distance_miles.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span>Unique cities</span>
              <span className="text-xl font-semibold">{data.unique_cities}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span>Border crossings</span>
              <span className="text-xl font-semibold">{data.border_crossings}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span>Complexity rating</span>
              <span className="text-xl font-semibold">
                {"⭐".repeat(data.complexity_rating)}
                {"☆".repeat(5 - data.complexity_rating)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-900">Quick stats</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          <dl className="grid gap-x-6 gap-y-4 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-neutral-500">Countries</dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-900">
                {data.countries.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Unique cities</dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-900">{data.unique_cities}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Border crossings</dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-900">{data.border_crossings}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Complexity</dt>
              <dd className="mt-1 text-lg font-semibold text-neutral-900">
                {complexityLabel(data.complexity_rating)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-900">Stadium transit access</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  City
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  Stadium
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  Access
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.stadium_access.map((stadium) => {
                const config = ratingConfig[stadium.rating];
                return (
                  <tr key={`${stadium.city}-${stadium.stadium}`}>
                    <td className="px-6 py-4 font-medium text-neutral-900">{stadium.city}</td>
                    <td className="px-6 py-4 text-neutral-700">{stadium.stadium}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{stadium.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-blue-100 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
          <h3 className="text-3xl font-semibold text-neutral-900">Plan Your {data.title} Journey</h3>
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
              prefetch={false}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500"
            >
              Plan your trip with the AI Trip Builder
            </Link>
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Explore detailed climate and city information below.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Climate outlook</h2>
          <ul className="mt-4 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            {data.climate_zones.map((climate) => (
              <li key={climate.city} className="border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0">
                <p className="text-base font-semibold text-neutral-900">{climate.city}</p>
                <p className="text-sm text-neutral-600">{climate.climate}</p>
                {climate.range_f && (
                  <p className="text-xs text-neutral-500">
                    Typical range: {climate.range_f[0]}-{climate.range_f[1]}°F
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Map of host cities</h2>
          <div className="mt-4 rounded-3xl border border-blue-100 bg-white/70 p-2 shadow-sm backdrop-blur-sm">
            <Map points={mapPoints} height={360} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-900">Complexity snapshot</h2>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-lg font-semibold text-neutral-900">
            <span>Rating:</span>
            <span>
              {"⭐".repeat(data.complexity_rating)}
              {"☆".repeat(5 - data.complexity_rating)}
            </span>
            <span className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {complexityLabel(data.complexity_rating)}
            </span>
          </div>
          <p className="mt-4 text-neutral-700">
            Group {data.id} carries a {complexityLabel(data.complexity_rating).toLowerCase()} profile.
            Use the transit and climate insights above to plan flights, border formalities, and repeat-city hops with fewer surprises.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-900">Best of city guides</h2>
        <div className="mt-4 rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.best_of_links.map((href) => {
              const cityName = href.split("/").pop()?.replace(/-/g, " ") ?? "City";
              const titleCase = cityName
                .split(" ")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
              return (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
                >
                  <p className="text-sm font-semibold text-blue-600">Best of</p>
                  <p className="mt-2 text-lg font-bold text-neutral-900 group-hover:text-blue-600">{titleCase}</p>
                  <p className="mt-3 text-sm text-neutral-600">
                    Dining, nightlife, and fan experiences for matchdays in {titleCase}.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/groups"
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-700"
          >
            Compare all groups
          </Link>
          <Link
            href={teamLink}
            className="inline-flex items-center justify-center rounded-full border border-blue-300 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            View teams in Group {data.id}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GroupTemplate;
