import { checkMembership } from '@/lib/membership';
import { redirect } from 'next/navigation';
import TripBuilderClient from './TripBuilderClient';

export default async function TripBuilderPage() {
  // Server-side membership check (belt and suspenders with middleware)
  const { isMember } = await checkMembership();

  if (!isMember) {
    redirect('/membership?redirect=/planner/trip-builder');
  }

  return <TripBuilderClient />;
}
