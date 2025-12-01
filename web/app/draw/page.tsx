import Link from "next/link";
import { groupDrawRows, type DrawRow } from "@/lib/draw";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "World Cup 2026 Draw — Groups A–L",
  description: "Live-updated 12 groups (A–L) with placeholders for playoff winners.",
};

export default async function DrawPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .order("group_code", { ascending: true })
    .order("slot", { ascending: true });

  if (error) {
    console.error("[draw page] failed to load draw_groups", error);
  }

  const rows = (data as DrawRow[]) ?? [];
  const grouped = groupDrawRows(rows);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-600">Live draw</p>
        <h1 className="text-3xl font-bold">World Cup 2026 Draw: Groups A–L</h1>
        <p className="text-sm text-gray-600">
          Updated from Supabase. Placeholders will flip to team names the moment you publish from
          the admin draw tool. Draft blog posts with {"{{A1}}"} etc. update at the same time.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No draw data yet. Add teams in <Link href="/admin/draw" className="text-blue-600 underline">/admin/draw</Link>.
        </div>
      ) : (
        <div className="grid gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(grouped).map(([groupCode, teams]) => (
            <div key={groupCode} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Group {groupCode}</h2>
                <span className="text-[11px] text-gray-500">4 teams</span>
              </div>
              <ul className="space-y-1">
                {teams.map((t) => (
                  <li key={t.slot}>
                    {t.team_name || "[TBD]"}
                    {t.is_placeholder && (
                      <span className="ml-1 text-[10px] uppercase text-orange-500">placeholder</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
