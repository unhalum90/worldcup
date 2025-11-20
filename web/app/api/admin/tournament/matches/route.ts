import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  if (process.env.ENABLE_TOURNAMENT !== 'true') {
    return new Response('Not Found', { status: 404 })
  }
  try {
    const body = await req.json()
    const { id, slug, status, winner_city_id } = body as {
      id?: string
      slug?: string
      status?: 'upcoming' | 'active' | 'closed'
      winner_city_id?: string | null
    }
    if (!id && !slug) return NextResponse.json({ error: 'id or slug required' }, { status: 400 })

    const supabase = await createServiceClient()
    const q = supabase.from('tournament_matches').update({
      status: status as any,
      winner_city_id: typeof winner_city_id === 'undefined' ? undefined : winner_city_id,
      updated_at: new Date().toISOString(),
    })
    const { data, error } = id ? await q.eq('id', id).select('id').single() : await q.eq('slug', slug!).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
