import { NextResponse } from 'next/server'
import { syncMailingList } from '@/lib/mailerlite/server'

export async function POST(req: Request) {
  try {
    const { email, source } = (await req.json()) as { email?: string; source?: string }
    console.log('[API] /api/newsletter/subscribe request', { email, source })
    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Reuse the canonical sync helper (same used by onboarding) so behavior matches
    const result = await syncMailingList({ email, source: source || 'tournament_cta' })
    console.log('[API] /api/newsletter/subscribe syncMailingList result', result)
    if (!result.ok) {
      // expose message where available to help diagnostics in preview
      return NextResponse.json({ ok: false, message: result.error || 'mailing_list_sync_failed' }, { status: 200 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

