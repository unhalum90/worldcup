import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type SaveTripBody = {
  tripInput?: unknown;
  itinerary?: unknown;
  title?: unknown;
  notes?: unknown;
  selectedOptionIndex?: unknown;
};

function sanitizeTitle(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 120);
}

function sanitizeNotes(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

function deriveAutoTitle(body: SaveTripBody): string {
  const tripInput = body.tripInput as { citiesVisiting?: string[] } | undefined;
  const itinerary = body.itinerary as { options?: Array<{ title?: string }> } | undefined;
  const requestedIndex = typeof body.selectedOptionIndex === 'number' ? body.selectedOptionIndex : undefined;

  const cities = Array.isArray(tripInput?.citiesVisiting)
    ? tripInput!.citiesVisiting.filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    : [];

  if (cities.length) {
    const preview = cities.slice(0, 3).join(' + ');
    const suffix = cities.length > 3 ? ' + more' : '';
    return `${preview} Trip${suffix}`;
  }

  if (Array.isArray(itinerary?.options) && itinerary!.options.length) {
    const idx = typeof requestedIndex === 'number' && requestedIndex >= 0 && requestedIndex < itinerary.options.length
      ? requestedIndex
      : 0;
    const title = itinerary.options[idx]?.title || itinerary.options[0]?.title;
    if (title && typeof title === 'string') {
      return title;
    }
  }

  return 'Saved World Cup Trip';
}

function normalizeSelectedIndex(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed >= 0 ? parsed : null;
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('travel_plan_saved')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trips: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SaveTripBody;
  try {
    body = (await req.json()) as SaveTripBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.itinerary || typeof body.itinerary !== 'object') {
    return NextResponse.json({ error: 'Missing itinerary payload' }, { status: 422 });
  }

  const sanitizedTitle = sanitizeTitle(body.title);
  const sanitizedNotes = sanitizeNotes(body.notes);
  const selectedIndex = normalizeSelectedIndex(body.selectedOptionIndex);
  const title = sanitizedTitle || deriveAutoTitle(body);

  const insertPayload = {
    user_id: user.id,
    trip_input: body.tripInput ?? null,
    itinerary: body.itinerary ?? null,
    selected_option_index: selectedIndex,
    title,
    notes: sanitizedNotes,
  };

  const { data, error } = await supabase
    .from('travel_plan_saved')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trip: data }, { status: 201 });
}
