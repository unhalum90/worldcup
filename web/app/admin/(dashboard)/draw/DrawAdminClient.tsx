"use client";

import { useMemo, useState, FormEvent } from "react";
import type { DrawGroupMap } from "@/lib/draw";

const SLOTS = [1, 2, 3, 4];

type GroupRowInput = {
  slot: number;
  team_name: string;
  team_slug: string;
  is_placeholder: boolean;
};

type GroupedInput = Record<string, GroupRowInput[]>;

function makeInitialInputs(grouped: DrawGroupMap, groups: string[]): GroupedInput {
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

      setStatus("Published. Supabase updated and placeholder drafts pushed live.");
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message ?? "Unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const previewData = useMemo(() => inputs, [inputs]);

  return (
    <div className="space-y-8">
      <form onSubmit={handlePublish} className="space-y-8">
        {groups.map((g) => (
          <section key={g} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Group {g}</h2>
              <span className="text-xs text-gray-500">4 slots · free entry (pots not enforced)</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {SLOTS.map((slot) => {
                const row = inputs[g].find((r) => r.slot === slot)!;
                return (
                  <div key={slot} className="space-y-2 rounded-md border border-gray-100 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-600">Group {g} — Team {slot}</div>

                    <label className="block text-xs font-semibold text-gray-700">
                      Team name
                      <input
                        type="text"
                        className="mt-1 w-full rounded border px-2 py-1 text-sm"
                        value={row.team_name}
                        onChange={(e) => handleChange(g, slot, "team_name", e.target.value)}
                      />
                    </label>

                    <label className="block text-xs font-semibold text-gray-700">
                      Team slug (optional)
                      <input
                        type="text"
                        className="mt-1 w-full rounded border px-2 py-1 text-sm"
                        value={row.team_slug}
                        onChange={(e) => handleChange(g, slot, "team_slug", e.target.value)}
                        placeholder="e.g., usa, argentina"
                      />
                    </label>

                    <label className="mt-1 flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={row.is_placeholder}
                        onChange={(e) => handleChange(g, slot, "is_placeholder", e.target.checked)}
                      />
                      Placeholder (TBD / playoff winner)
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="rounded border px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Preview layout
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
          {status && <span className="text-xs text-gray-600">{status}</span>}
        </div>
      </form>

      {previewMode && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{"Preview ({{A1}} → team names)"}</h2>
            <span className="text-xs text-gray-500">12 groups · live from form state</span>
          </div>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            {groups.map((g) => (
              <div key={g} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold">Group {g}</span>
                  <span className="text-[11px] text-gray-500">4 teams</span>
                </div>
                <ul className="space-y-1">
                  {previewData[g].map((row) => (
                    <li key={row.slot}>
                      {row.team_name || <span className="text-gray-400">[empty]</span>}
                      {row.is_placeholder && (
                        <span className="ml-1 text-[10px] uppercase text-orange-500">placeholder</span>
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
//ADDED NOTE
