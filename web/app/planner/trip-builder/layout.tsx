import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isActiveMember } from '@/lib/membership'

// Ensure this route is treated as dynamic, since it reads cookies/session
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'AI Trip Builder | WC26 Fan Zone',
  description: 'Plan your perfect World Cup 2026 trip with AI-powered routing, lodging and daily logistics.',
}

export default async function TripBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectTarget = '/planner/trip-builder'

  // If not logged in, send to memberships page (which will in turn route
  // through the login + checkout flow).
  if (!user) {
    redirect(`/memberships?from=planner&redirect=${encodeURIComponent(redirectTarget)}`)
  }

  // If logged in but not an active member, send to memberships so they can
  // purchase or upgrade. Waiting page is reserved for post-checkout flows.
  try {
    const active = await isActiveMember(supabase, user.id)
    if (!active) {
      redirect(`/memberships?from=planner&redirect=${encodeURIComponent(redirectTarget)}`)
    }
  } catch {
    // On any unexpected error, be conservative and send to memberships as well.
    redirect(`/memberships?from=planner&redirect=${encodeURIComponent(redirectTarget)}`)
  }

  return children
}
