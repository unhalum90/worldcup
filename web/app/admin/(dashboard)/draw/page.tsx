import { groupDrawRows, type DrawRow } from "@/lib/draw";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import DrawAdminClient from "./DrawAdminClient";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const dynamic = "force-dynamic";

async function getInitialDrawRows(): Promise<DrawRow[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("draw_groups")
      .select("*")
      .order("group_code", { ascending: true })
      .order("slot", { ascending: true });

    if (error) {
      console.error("[admin/draw] failed to load draw_groups", error);
      return [];
    }

    return (data as DrawRow[]) ?? [];
  } catch (err) {
    console.error("[admin/draw] unexpected load error", err);
    return [];
  }
}

export default async function DrawAdminPage() {
  const rows = await getInitialDrawRows();
  const grouped = groupDrawRows(rows);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-600">
          Draw control
        </p>
        <h1 className="text-3xl font-bold">World Cup Draw — Admin</h1>
        <p className="text-sm text-gray-600 mt-2">
          Enter the 12 groups (A–L), 4 teams each. Mark placeholders for the playoff
          slots. Publish will upsert Supabase and auto-publish any draft blog posts
          containing placeholders like {"{{A1}}"}.
        </p>
      </div>

      <DrawAdminClient initialGrouped={grouped} groups={GROUPS} />
    </div>
  );
}
