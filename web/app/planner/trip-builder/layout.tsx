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
  console.log('[TB] layout invoked - checking membership')
  const { isMember, userId } = await checkMembership()
  console.log('[TB] layout membership result', { userId, isMember })

  if (!userId) {
    console.log('[TB] No userId - redirecting to /login')
    redirect('/login?redirect=/planner/trip-builder')
  }

  if (!isMember) {
    console.log('[TB] Not a member - redirecting to paywall', { userId })
    redirect('/membership/paywall?redirect=/planner/trip-builder')
  }

  console.log('[TB] Access granted', { userId })
  return children
}
