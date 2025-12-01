Good catch on the format; let’s rebuild it for **12 groups (A–L), 4 teams each, 42 known + 6 playoff placeholders**.

Below is a full system you can drop into your Next.js app (App Router + Supabase).
You can then refine styling, admin auth, and copy, but the core logic will work.

---

## 1. SQL migration: `draw_groups`

Create a migration file, e.g. `supabase/migrations/20251130_draw_groups.sql`:

```sql
create table if not exists public.draw_groups (
  id uuid primary key default gen_random_uuid(),
  group_code text not null check (group_code ~ '^[A-L]$'),
  slot int not null check (slot >= 1 and slot <= 4),
  team_name text,
  team_slug text,
  is_placeholder boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (group_code, slot)
);

alter table public.draw_groups enable row level security;

create policy "draw_groups_select_public"
on public.draw_groups
for select
using (true);

-- Seed the 12×4 = 48 slots with empty rows
insert into public.draw_groups (group_code, slot)
select g, s
from unnest(array['A','B','C','D','E','F','G','H','I','J','K','L']) as g,
     generate_series(1,4) as s
on conflict (group_code, slot) do nothing;
```

You can mark the 6 March play-off slots as placeholders via the admin UI.

---

## 2. Shared helpers: `lib/draw.ts`

```ts
// src/lib/draw.ts
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
  { slot: number; team_name: string | null; team_slug: string | null; is_placeholder: boolean }[]
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

/**
 * Placeholder keys: {{A1}} ... {{L4}} -> team_name
 */
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
    return placeholderMap[key] ?? match;
  });
}
```

---

## 3. Admin draw control panel

### 3.1 Server component: `app/admin/draw/page.tsx`

```tsx
// src/app/admin/draw/page.tsx
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { groupDrawRows, DrawRow } from "@/lib/draw";
import DrawAdminClient from "./DrawAdminClient";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export const dynamic = "force-dynamic";

async function getInitialDrawRows() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .order("group_code", { ascending: true })
    .order("slot", { ascending: true });

  if (error) {
    console.error("Error loading draw_groups", error);
    return [];
  }
  return (data ?? []) as DrawRow[];
}

// Replace with your own admin check (email, role, etc.)
async function assertIsAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "you@example.com") {
    notFound();
  }
}

export default async function DrawAdminPage() {
  await assertIsAdmin();
  const initialRows = await getInitialDrawRows();
  const grouped = groupDrawRows(initialRows);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold mb-2">World Cup Draw — Admin Control Panel</h1>
      <p className="text-sm text-gray-500 mb-6">
        12 groups (A–L), 4 slots each. Enter team names and slugs. For March playoff
        spots, mark them as placeholders. Preview in-page, then publish once.
      </p>
      <DrawAdminClient initialGrouped={grouped} groups={GROUPS} />
    </div>
  );
}
```

### 3.2 Client component: `app/admin/draw/DrawAdminClient.tsx`

```tsx
// src/app/admin/draw/DrawAdminClient.tsx
"use client";

import { useState, useMemo, FormEvent } from "react";
import type { DrawGroupMap } from "@/lib/draw";

const SLOTS = [1, 2, 3, 4];

type GroupRowInput = {
  slot: number;
  team_name: string;
  team_slug: string;
  is_placeholder: boolean;
};

type GroupedInput = {
  [groupCode: string]: GroupRowInput[];
};

function makeInitialInputs(
  grouped: DrawGroupMap,
  groups: string[]
): GroupedInput {
  const result: GroupedInput = {};
  for (const g of groups) {
    const rows = grouped[g] ?? [];
    result[g] = SLOTS.map((slot) => {
      const existing = rows.find((r) => r.slot === slot);
      return {
        slot,
        team_name: existing?.team_name ?? "",
        team_slug: existing?.team_slug ?? "",
        is_placeholder: existing?.is_placeholder ?? false,
      };
    });
  }
  return result;
}

export default function DrawAdminClient({
  initialGrouped,
  groups,
}: {
  initialGrouped: DrawGroupMap;
  groups: string[];
}) {
  const [inputs, setInputs] = useState<GroupedInput>(() =>
    makeInitialInputs(initialGrouped, groups)
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (
    group: string,
    slot: number,
    field: keyof Omit<GroupRowInput, "slot">,
    value: string | boolean
  ) => {
    setInputs((prev) => {
      const groupRows = prev[group] ?? [];
      const updated = groupRows.map((row) =>
        row.slot === slot ? { ...row, [field]: value } : row
      );
      return {
        ...prev,
        [group]: updated,
      };
    });
  };

  const previewData = useMemo(() => inputs, [inputs]);

  const handlePreview = () => {
    setPreviewMode(true);
    setStatus(null);
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setStatus(null);

    try {
      const payload = {
        groups: groups.map((g) => ({
          group_code: g,
          slots: inputs[g] ?? [],
        })),
      };

      const res = await fetch("/api/draw/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to publish");
      }

      setStatus("Published successfully. Public pages should now reflect the draw.");
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message ?? "Unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handlePublish} className="space-y-8">
        {groups.map((g) => (
          <section key={g} className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Group {g}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SLOTS.map((slot) => {
                const row = inputs[g].find((r) => r.slot === slot)!;
                return (
                  <div key={slot} className="border rounded-md p-3 space-y-2">
                    <div className="text-xs font-medium text-gray-500">
                      Group {g} – Team {slot}
                    </div>

                    <label className="block text-xs font-semibold">
                      Team name
                      <input
                        type="text"
                        className="mt-1 w-full rounded border px-2 py-1 text-sm"
                        value={row.team_name}
                        onChange={(e) =>
                          handleChange(g, slot, "team_name", e.target.value)
                        }
                      />
                    </label>

                    <label className="block text-xs font-semibold">
                      Team slug (for /teams/[slug])
                      <input
                        type="text"
                        className="mt-1 w-full rounded border px-2 py-1 text-sm"
                        value={row.team_slug}
                        onChange={(e) =>
                          handleChange(g, slot, "team_slug", e.target.value)
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs mt-1">
                      <input
                        type="checkbox"
                        checked={row.is_placeholder}
                        onChange={(e) =>
                          handleChange(g, slot, "is_placeholder", e.target.checked)
                        }
                      />
                      <span>Placeholder (playoff winner / TBD)</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePreview}
            className="rounded border px-4 py-2 text-sm"
          >
            Preview layout
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {isPublishing ? "Publishing…" : "Publish all"}
          </button>
          {status && <span className="text-xs text-gray-600">{status}</span>}
        </div>
      </form>

      {previewMode && (
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Preview (Groups A–L)</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {groups.map((g) => (
              <div key={g} className="border rounded-md p-3">
                <div className="font-semibold mb-1">Group {g}</div>
                <ul className="space-y-1">
                  {inputs[g].map((row) => (
                    <li key={row.slot}>
                      {row.team_name || <span className="text-gray-400">[empty]</span>}
                      {row.is_placeholder && (
                        <span className="ml-1 text-[10px] uppercase text-orange-500">
                          (placeholder)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## 4. Publish API route: `app/api/draw/publish/route.ts`

Uses Supabase service role to upsert all 48 rows in one go.

```ts
// src/app/api/draw/publish/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type SlotPayload = {
  slot: number;
  team_name: string;
  team_slug: string;
  is_placeholder: boolean;
};

type GroupPayload = {
  group_code: string; // "A".."L"
  slots: SlotPayload[];
};

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new NextResponse("Supabase env not configured", { status: 500 });
    }

    const body = (await req.json()) as { groups: GroupPayload[] };
    if (!body?.groups || !Array.isArray(body.groups)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const rowsToUpsert = body.groups.flatMap((g) =>
      g.slots.map((slot) => ({
        group_code: g.group_code,
        slot: slot.slot,
        team_name: slot.team_name || null,
        team_slug: slot.team_slug || null,
        is_placeholder: !!slot.is_placeholder,
      }))
    );

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error } = await supabase.from("draw_groups").upsert(rowsToUpsert, {
      onConflict: "group_code,slot",
    });

    if (error) {
      console.error(error);
      return new NextResponse("Failed to upsert draw_groups", { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```

This route is server-only; do not expose the service key client-side.

---

## 5. Group pages: `/groups/[group]` and `/groups`

### 5.1 Single group page: `app/groups/[group]/page.tsx`

```tsx
// src/app/groups/[group]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DrawRow, groupDrawRows } from "@/lib/draw";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default async function GroupPage({
  params,
}: {
  params: { group: string };
}) {
  const groupCode = params.group.toUpperCase();
  if (!GROUPS.includes(groupCode)) {
    return <div className="p-6">Unknown group.</div>;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .eq("group_code", groupCode)
    .order("slot", { ascending: true });

  if (error) {
    console.error(error);
  }

  const rows = (data ?? []) as DrawRow[];
  const grouped = groupDrawRows(rows);
  const teams = grouped[groupCode] ?? [];

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">World Cup 2026 — Group {groupCode}</h1>

      <ul className="space-y-2">
        {teams.map((t) => (
          <li key={t.slot} className="flex items-center gap-2">
            <span className="w-6 text-xs text-gray-500">#{t.slot}</span>
            {t.team_slug ? (
              <Link
                href={`/teams/${t.team_slug}`}
                className="underline hover:no-underline"
              >
                {t.team_name}
              </Link>
            ) : (
              <span>{t.team_name || "[TBD]"}</span>
            )}
            {t.is_placeholder && (
              <span className="ml-1 text-[10px] uppercase text-orange-500">
                placeholder
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Add travel tips, host cities, etc., here */}
    </div>
  );
}
```

### 5.2 Master groups page: `app/groups/page.tsx`

```tsx
// src/app/groups/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DrawRow, groupDrawRows } from "@/lib/draw";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AllGroupsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .order("group_code", { ascending: true })
    .order("slot", { ascending: true });

  if (error) {
    console.error(error);
  }

  const rows = (data ?? []) as DrawRow[];
  const grouped = groupDrawRows(rows);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">World Cup 2026 — Group Draw</h1>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
        {Object.entries(grouped).map(([groupCode, teams]) => (
          <div key={groupCode} className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">Group {groupCode}</h2>
              <Link
                href={`/groups/${groupCode}`}
                className="text-[11px] text-blue-600 underline"
              >
                details
              </Link>
            </div>
            <ul className="space-y-1">
              {teams.map((t) => (
                <li key={t.slot}>
                  {t.team_name || "[TBD]"}
                  {t.is_placeholder && (
                    <span className="ml-1 text-[10px] uppercase text-orange-500">
                      placeholder
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Draw landing page: `app/draw/page.tsx`

This page can act as your primary draw-day SEO + funnel page.

```tsx
// src/app/draw/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DrawRow, groupDrawRows } from "@/lib/draw";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "World Cup 2026 Draw — Groups, Teams, Travel Guides",
  description:
    "Official group breakdown for the 2026 World Cup: all 12 groups (A–L), teams, and travel tips for each host city.",
};

export default async function DrawLandingPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("draw_groups")
    .select("*")
    .order("group_code", { ascending: true })
    .order("slot", { ascending: true });

  if (error) {
    console.error(error);
  }

  const rows = (data ?? []) as DrawRow[];
  const grouped = groupDrawRows(rows);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">
          World Cup 2026 Draw: All 12 Groups (A–L)
        </h1>
        <p className="text-sm text-gray-600">
          Live-updated: 42 qualified teams plus 6 playoff placeholders to be
          decided in March. Click any group to see key matches and travel
          suggestions.
        </p>
        {/* Add CTAs here: free PDF, membership, etc. */}
      </header>

      <section>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          {Object.entries(grouped).map(([groupCode, teams]) => (
            <div key={groupCode} className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold">Group {groupCode}</h2>
                <Link
                  href={`/groups/${groupCode}`}
                  className="text-[11px] text-blue-600 underline"
                >
                  details
                </Link>
              </div>
              <ul className="space-y-1">
                {teams.map((t) => (
                  <li key={t.slot}>
                    {t.team_name || "[TBD]"}
                    {t.is_placeholder && (
                      <span className="ml-1 text-[10px] uppercase text-orange-500">
                        placeholder
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 7. Using placeholders in draft blogs / emails

If you have templates like:

```md
# Group {{A1}}'s Road to 2026

In Group A, {{A1}}, {{A2}}, {{A3}}, and {{A4}} will battle for progression…
```

You can generate final content server-side as needed:

```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPlaceholderMap, replaceDrawPlaceholders, DrawRow } from "@/lib/draw";

export async function generateDrawBlogFromTemplate(template: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("draw_groups")
    .select("*");

  const rows = (data ?? []) as DrawRow[];
  const map = buildPlaceholderMap(rows);
  return replaceDrawPlaceholders(template, map);
}
```

---

### How this meets your constraints

* **12 groups of 4** (A–L) handled throughout.
* **42 qualified + 6 placeholders**: you mark the 6 as `is_placeholder = true` on Friday, with placeholder labels like “Playoff Winner 1”.
* **Admin draw page**: you type teams once, hit Publish, and all:

  * `/draw`
  * `/groups`
  * `/groups/[group]`
  * any template-driven blogs/emails
    instantly reflect the draw (no redeploy needed because pages are `force-dynamic` and read from Supabase).

If you want, next step can be generating 1–2 example blog templates using `{{A1}}...{{L4}}` and a tiny script to materialize them into posts from Supabase on draw day.
