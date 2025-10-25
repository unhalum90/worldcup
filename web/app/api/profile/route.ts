import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MAJOR_AIRPORTS } from '@/lib/airportData';
import { validateProfileInput } from '@/lib/profile/types';

function findAirportByCode(code: string) {
  const c = code.toUpperCase();
  return MAJOR_AIRPORTS.find((a) => a.code === c) || null;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
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
    const supabase = await createClient();
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
    return NextResponse.json({ profile: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
