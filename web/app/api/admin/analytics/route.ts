import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('analytics_overview').select('*').maybeSingle();

    if (error || !data) {
      console.error('[Admin Analytics] failed to fetch analytics_overview', error);
      return NextResponse.json({ error: 'analytics_unavailable' }, { status: 500 });
    }

    return NextResponse.json({ stats: data });
  } catch (err) {
    console.error('[Admin Analytics] unexpected error', err);
    return NextResponse.json({ error: 'analytics_unavailable' }, { status: 500 });
  }
}
