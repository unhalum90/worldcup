import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

type RouteParams =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

type UpdateBody = {
  title?: unknown;
  notes?: unknown;
  selectedOptionIndex?: unknown;
  tripInput?: unknown;
  itinerary?: unknown;
};

function withDefaultTitle(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) {
    return 'Saved World Cup Trip';
  }
  return trimmed.slice(0, 120);
}

function normalizeNotes(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

function normalizeSelectedIndex(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed >= 0 ? parsed : null;
}

function missingIdResponse() {
  return NextResponse.json({ error: 'Missing travel plan id' }, { status: 400 });
}

async function ensureUser() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return { supabase, user, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { supabase, user, response: null as NextResponse | null };
}

export async function GET(_req: NextRequest, context: RouteParams) {
  const id = await resolveRouteId(context);
  if (!id) return missingIdResponse();

  const { supabase, user, response } = await ensureUser();
  if (!user || response) return response!;

  const { data, error } = await supabase
    .from('travel_plan_saved')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ trip: data }, { status: 200 });
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  const id = await resolveRouteId(context);
  if (!id) return missingIdResponse();

  const { supabase, user, response } = await ensureUser();
  if (!user || response) return response!;

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  const title = withDefaultTitle(body.title);
  const notes = normalizeNotes(body.notes);
  const selected = normalizeSelectedIndex(body.selectedOptionIndex);

  if (title !== undefined) updates.title = title;
  if (notes !== undefined) updates.notes = notes;
  if (selected !== undefined) updates.selected_option_index = selected;
  if (body.tripInput !== undefined) updates.trip_input = body.tripInput ?? null;
  if (body.itinerary !== undefined) updates.itinerary = body.itinerary ?? null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('travel_plan_saved')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ trip: data }, { status: 200 });
}

export async function DELETE(_req: NextRequest, context: RouteParams) {
  const id = await resolveRouteId(context);
  if (!id) return missingIdResponse();

  const { supabase, user, response } = await ensureUser();
  if (!user || response) return response!;

  const { error } = await supabase
    .from('travel_plan_saved')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

async function resolveRouteId(context: RouteParams): Promise<string | null> {
  if (!context || !('params' in context)) return null;
  const params = await context.params;
  return params?.id ?? null;
}
