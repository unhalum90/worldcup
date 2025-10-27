import { NextRequest, NextResponse } from 'next/server';
import { filterMatches, groupByCity } from '@/lib/matchSchedule';

export async function POST(request: NextRequest) {
  try {
    const { cities = [], startDate, endDate, group = true } = await request.json();
    const matches = filterMatches({ cities, startDate, endDate });
    if (group) {
      return NextResponse.json({ success: true, grouped: groupByCity(matches) });
    }
    return NextResponse.json({ success: true, matches });
  } catch (e) {
    console.error('matches route error', e);
    return NextResponse.json({ success: false, error: 'Failed to load matches' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citiesParam = searchParams.getAll('city');
    const citiesCsv = searchParams.get('cities');
    const cities = citiesCsv ? citiesCsv.split(',').map(s => s.trim()).filter(Boolean) : citiesParam;
    const startDate = searchParams.get('startDate') || searchParams.get('start') || undefined;
    const endDate = searchParams.get('endDate') || searchParams.get('end') || undefined;
    const group = (searchParams.get('group') || 'true') === 'true';
    const matches = filterMatches({ cities, startDate, endDate });
    if (group) {
      return NextResponse.json({ success: true, grouped: groupByCity(matches) });
    }
    return NextResponse.json({ success: true, matches });
  } catch (e) {
    console.error('matches route error', e);
    return NextResponse.json({ success: false, error: 'Failed to load matches' }, { status: 500 });
  }
}

