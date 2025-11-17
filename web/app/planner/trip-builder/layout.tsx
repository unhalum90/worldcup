import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
// Membership helpers are available in `@/lib/membership` but gating is
// currently disabled for testing. Keep the import commented until we
// re-enable gating to avoid build-time type errors.
// import { checkMembership } from '@/lib/membership'
import { headers as nextHeaders } from 'next/headers'

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
  // Membership gating is temporarily disabled.
  /*
  let rid: string | null = null;
  try {
    const h = await nextHeaders();
    rid = h.get('x-fz-req-id');
  } catch {}
  console.log('[TB] layout invoked - checking membership', { rid })
  const { isMember, userId } = await checkMembership()
  console.log('[TB] layout membership result', { rid, userId, isMember })

  if (!userId) {
    console.log('[TB] No userId - redirecting to /login', { rid })
    redirect('/login?redirect=/planner/trip-builder')
  }

  if (!isMember) {
    console.log('[TB] Not a member - redirecting to paywall', { rid, userId })
    redirect('/membership/paywall?redirect=/planner/trip-builder')
  }

  console.log('[TB] Access granted', { rid, userId })
  */
  return children
}
