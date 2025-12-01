export type DrawRow = {
  id: string;
  group_code: string;
  slot: number;
  team_name: string | null;
  team_slug: string | null;
  is_placeholder: boolean;
};

export type DrawGroupMap = Record<
  string,
  {
    slot: number;
    team_name: string | null;
    team_slug: string | null;
    is_placeholder: boolean;
  }[]
>;

export function groupDrawRows(rows: DrawRow[]): DrawGroupMap {
  const grouped: DrawGroupMap = {};
  for (const row of rows) {
    if (!grouped[row.group_code]) {
      grouped[row.group_code] = [];
    }
    grouped[row.group_code].push({
      slot: row.slot,
      team_name: row.team_name,
      team_slug: row.team_slug,
      is_placeholder: row.is_placeholder,
    });
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.slot - b.slot);
  }
  return grouped;
}

export function buildPlaceholderMap(rows: DrawRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    const key = `${row.group_code}${row.slot}`;
    map[key] = row.team_name ?? "";
  }
  return map;
}

export function replaceDrawPlaceholders(
  template: string,
  placeholderMap: Record<string, string>
): string {
  return template.replace(/\{\{([A-L][1-4])\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(placeholderMap, key)
      ? placeholderMap[key] ?? ""
      : match;
  });
}
