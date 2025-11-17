import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { MAJOR_AIRPORTS } from '@/lib/airportData';
import { validateProfileInput } from '@/lib/profile/types';
import { syncMailingList } from '@/lib/mailerlite/server';

function findAirportByCode(code: string) {
  const c = code.toUpperCase();
  return MAJOR_AIRPORTS.find((a) => a.code === c) || null;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.from('user_profile').select('*').eq('user_id', user.id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ profile: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = validateProfileInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 422 });

  const patch: any = parsed.value;

    // If a home_airport was provided, ensure it matches our dataset for code correctness.
    if (patch.home_airport?.code) {
      const known = findAirportByCode(patch.home_airport.code);
      if (known) {
        patch.home_airport = {
          code: known.code,
          name: known.name,
          city: known.city,
          country: known.country,
        };
      }
    }

    // Legacy aggregate: maintain `children` if buckets provided
    if (patch.children_0_5 !== undefined || patch.children_6_18 !== undefined) {
      const c1 = Number(patch.children_0_5 ?? 0);
      const c2 = Number(patch.children_6_18 ?? 0);
      patch.children = Math.max(0, (isFinite(c1) ? c1 : 0) + (isFinite(c2) ? c2 : 0));
    }

    // Upsert by user_id unique constraint
    const { data, error } = await supabase
      .from('user_profile')
      .upsert({ user_id: user.id, ...patch }, { onConflict: 'user_id' })
      .select('*')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (user.email && data) {
      const tags: string[] = ['onboarding_completed'];
      if (Array.isArray(data.travel_focus)) {
        data.travel_focus
          .filter((focus: unknown): focus is string => typeof focus === 'string' && focus.trim().length > 0)
          .forEach((focus: string) => tags.push(`focus:${focus.trim()}`));
      }
      if (data.has_tickets) tags.push('has_tickets');
      if (data.favorite_team) tags.push(`team:${String(data.favorite_team).trim()}`);

      const fields = {
        source: 'onboarding',
        home_airport: data.home_airport?.code ?? null,
        group_size: data.group_size ?? null,
        tickets: data.has_tickets ? 1 : 0,
        climate_pref: data.climate_preference ?? null,
        favorite_team: data.favorite_team ?? null,
      };

      const metadata = {
        profile_snapshot: {
          home_airport: data.home_airport,
          group_size: data.group_size,
          children_0_5: data.children_0_5,
          children_6_18: data.children_6_18,
          seniors: data.seniors,
          has_tickets: data.has_tickets,
          ticket_match: data.ticket_match,
          travel_focus: data.travel_focus,
          preferred_transport: data.preferred_transport,
          budget_level: data.budget_level,
          climate_preference: data.climate_preference,
        },
      };

      try {
        await syncMailingList({
          email: user.email,
          userId: user.id,
          source: 'onboarding',
          tags,
          metadata,
          fields,
          confirmed: true,
        });
      } catch (syncError) {
        console.error('[Profile] Failed to sync MailerLite subscriber', syncError);
      }
    }

    return NextResponse.json({ profile: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
