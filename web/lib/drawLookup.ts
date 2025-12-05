import { getSupabaseServerClient } from "@/lib/supabaseServer";

export type DrawEntry = {
  group_code: string;
  slot: number;
  team_name: string | null;
  team_slug: string | null;
  is_placeholder: boolean;
};

/**
 * Returns a map of team_slug → group_code from Supabase draw_groups.
 * Call from server components or API routes.
 */
export async function getTeamToGroupMap(): Promise<Record<string, string>> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("team_slug, group_code")
    .not("team_slug", "is", null);

  if (error) {
    console.error("[drawLookup] failed to fetch draw_groups", error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.team_slug) {
      map[row.team_slug] = row.group_code;
    }
  }
  return map;
}

/**
 * Returns all teams in a specific group, ordered by slot.
 */
export async function getTeamsInGroup(groupCode: string): Promise<DrawEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .eq("group_code", groupCode.toUpperCase())
    .order("slot", { ascending: true });

  if (error) {
    console.error(`[drawLookup] failed to fetch group ${groupCode}`, error);
    return [];
  }

  return (data as DrawEntry[]) ?? [];
}

/**
 * Returns all draw entries grouped by group_code.
 */
export async function getAllDrawGroups(): Promise<Record<string, DrawEntry[]>> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .order("group_code", { ascending: true })
    .order("slot", { ascending: true });

  if (error) {
    console.error("[drawLookup] failed to fetch all draw_groups", error);
    return {};
  }

  const grouped: Record<string, DrawEntry[]> = {};
  for (const row of (data as DrawEntry[]) ?? []) {
    if (!grouped[row.group_code]) {
      grouped[row.group_code] = [];
    }
    grouped[row.group_code].push(row);
  }
  return grouped;
}
