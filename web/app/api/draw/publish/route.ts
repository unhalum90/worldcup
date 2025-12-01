import { NextResponse } from "next/server";
import { buildPlaceholderMap, replaceDrawPlaceholders, type DrawRow } from "@/lib/draw";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

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

const PLACEHOLDER_REGEX = /\{\{[A-L][1-4]\}\}/;

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const body = (await req.json()) as { groups?: GroupPayload[] };

    if (!body?.groups || !Array.isArray(body.groups)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const rowsToUpsert = body.groups.flatMap((g) =>
      (g.slots || []).map((slot) => ({
        group_code: g.group_code,
        slot: slot.slot,
        team_name: slot.team_name || null,
        team_slug: slot.team_slug || null,
        is_placeholder: !!slot.is_placeholder,
      }))
    );

    const { error: upsertError } = await supabase.from("draw_groups").upsert(rowsToUpsert, {
      onConflict: "group_code,slot",
    });

    if (upsertError) {
      console.error("[draw/publish] upsert error", upsertError);
      return new NextResponse("Failed to upsert draw_groups", { status: 500 });
    }

    // Build placeholder map from current draw data
    const { data: drawRows, error: fetchError } = await supabase
      .from("draw_groups")
      .select("*");

    if (fetchError) {
      console.error("[draw/publish] fetch draw_groups error", fetchError);
      return new NextResponse("Failed to read draw_groups", { status: 500 });
    }

    const placeholderMap = buildPlaceholderMap((drawRows as DrawRow[]) ?? []);

    // Find drafts that contain placeholders, replace, and publish them
    const { data: drafts, error: draftError } = await supabase
      .from("blog_posts")
      .select("id, content_markdown")
      .eq("status", "draft");

    if (draftError) {
      console.error("[draw/publish] fetch drafts error", draftError);
      return new NextResponse("Failed to load drafts", { status: 500 });
    }

    const updates = [];
    const now = new Date().toISOString();

    for (const draft of drafts ?? []) {
      const content = draft.content_markdown ?? "";
      if (!PLACEHOLDER_REGEX.test(content)) {
        continue;
      }
      const replaced = replaceDrawPlaceholders(content, placeholderMap);
      updates.push({
        id: draft.id,
        content_markdown: replaced,
        status: "published",
        published_at: now,
      });
    }

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
          content_markdown: update.content_markdown,
          status: update.status,
          published_at: update.published_at,
        })
        .eq("id", update.id);

      if (updateError) {
        console.error("[draw/publish] update draft error", update.id, updateError);
        return new NextResponse("Failed to publish drafts", { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      upserted: rowsToUpsert.length,
      publishedDrafts: updates.length,
    });
  } catch (err: any) {
    console.error("[draw/publish] unexpected error", err);
    return new NextResponse(err?.message || "Internal error", { status: 500 });
  }
}
