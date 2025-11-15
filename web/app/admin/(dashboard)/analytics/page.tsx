"use client";

import useSWR from "swr";

type Stats = {
  report_date: string;
  total_users: number;
  new_users_24h: number;
  total_trip_plans: number;
  trip_plans_24h: number;
  flight_plans_total: number;
  flight_plans_24h: number;
  lodging_plans_total: number;
  lodging_plans_24h: number;
};

type ApiResponse = { stats: Stats };

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }
      return res.json();
    })
    .then((json: ApiResponse) => json);

export default function AnalyticsDashboard() {
  const { data, error } = useSWR<ApiResponse>("/api/admin/analytics", fetcher, {
    refreshInterval: 60_000,
  });

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-900 text-gray-100 p-8">
        <p className="text-red-400">Unable to load analytics.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-neutral-900 text-gray-100 p-8">
        <p className="text-gray-400">Loading analytics...</p>
      </main>
    );
  }

  const stats = data.stats;

  return (
    <main className="min-h-screen bg-neutral-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Fan Zone Admin Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="New Users (24h)" value={stats.new_users_24h} />
        <StatCard label="Trip Plans (24h)" value={stats.trip_plans_24h} />
        <StatCard label="Total Trip Plans" value={stats.total_trip_plans} />
        <StatCard label="Flights Generated (24h)" value={stats.flight_plans_24h} />
        <StatCard label="Total Flights Generated" value={stats.flight_plans_total} />
        <StatCard label="Lodging Plans (24h)" value={stats.lodging_plans_24h} />
        <StatCard label="Total Lodging Plans" value={stats.lodging_plans_total} />
      </div>
      <p className="mt-8 text-sm text-gray-500">Last updated: {stats.report_date}</p>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-800 p-6 rounded-2xl shadow-lg text-center border border-neutral-700">
      <h2 className="text-xl font-semibold text-gray-300 mb-2">{label}</h2>
      <p className="text-4xl font-bold text-emerald-400">{value}</p>
    </div>
  );
}

