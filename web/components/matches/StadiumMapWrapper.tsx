'use client';

import dynamic from 'next/dynamic';
import type { VenueExtended } from '@/src/data/venuesExtended';

// Dynamically import to avoid SSR issues with Leaflet
const StadiumMap = dynamic(() => import('./StadiumMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});

interface StadiumMapWrapperProps {
  venue: VenueExtended;
  className?: string;
}

export default function StadiumMapWrapper({ venue, className }: StadiumMapWrapperProps) {
  return <StadiumMap venue={venue} className={className} />;
}
