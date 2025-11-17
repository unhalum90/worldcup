import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { checkMembership } from '@/lib/membership'

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
  const { isMember, userId } = await checkMembership()

  if (!userId) {
    redirect('/login?redirect=/planner/trip-builder')
  }

  if (!isMember) {
    redirect('/membership/paywall?redirect=/planner/trip-builder')
  }

  return children
}
