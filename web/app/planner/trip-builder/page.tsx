// web/app/planner/trip-builder/page.tsx - No gating, open access
import TripBuilderClient from './TripBuilderClient';

export default async function TripBuilderPage() {
  // Direct access to trip builder - no gating
  return <TripBuilderClient />;
}
