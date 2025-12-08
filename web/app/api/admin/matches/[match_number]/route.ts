import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ match_number: string }> }
) {
  const { match_number } = await params;
  const matchNum = parseInt(match_number);

  if (isNaN(matchNum) || matchNum < 1 || matchNum > 72) {
    return NextResponse.json({ error: 'Invalid match number' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('match_pages')
    .select('*')
    .eq('match_number', matchNum)
    .single();

  if (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
