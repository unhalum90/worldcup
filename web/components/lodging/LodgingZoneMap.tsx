'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { LodgingMapMarker } from '@/types/lodging';

const MapBody = dynamic(() => import('./LodgingZoneMapBody'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 animate-pulse flex items-center justify-center text-sm text-white/60">
      Loading map…
    </div>
  ),
});

interface LodgingZoneMapProps {
  markers: LodgingMapMarker[];
}

/**
 * Wrapper to keep the map client-only while the parent component can remain server-compatible.
 */
export default function LodgingZoneMap({ markers }: LodgingZoneMapProps) {
  const safeMarkers = useMemo(
    () =>
      markers?.map((marker) => ({
        ...marker,
        lat: Number(marker.lat),
        lng: Number(marker.lng),
        matchScore: Number(marker.matchScore ?? 0),
      })) ?? [],
    [markers]
  );

  if (!safeMarkers.length) {
    return (
      <div className="h-72 w-full rounded-3xl bg-white border border-rose-100 shadow-lg flex flex-col items-center justify-center text-center text-gray-600">
        <p className="font-semibold">Map preview coming soon</p>
        <p className="text-xs">We’ll highlight each recommended zone once map data is available.</p>
      </div>
    );
  }

  return <MapBody markers={safeMarkers} />;
}
