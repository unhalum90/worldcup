"use client";

import dynamic from "next/dynamic";
// Load the Leaflet-based Map only on the client to avoid `window` reference during SSR
const ClientMap = dynamic(() => import("@/components/Map"), { ssr: false });

type Props = {
  cityName: string;
  stadium: string;
  lat: number;
  lng: number;
  mapImage?: string | null;
};

export default function LocationMap({ cityName, stadium, lat, lng, mapImage }: Props) {
  return (
    <div>
      {mapImage ? (
        // Use a regular img so the container height naturally follows the image's
        <img
          src={mapImage}
          alt={`${cityName} Stadium Map`}
          className="w-full h-auto rounded-xl shadow-md"
        />
      ) : (
        <ClientMap
          points={[{ city: cityName, stadium, lat, lng }]}
          height={400}
          className="rounded-xl overflow-hidden"
        />
      )}
    </div>
  );
}
