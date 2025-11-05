"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon =
  typeof window !== "undefined"
    ? L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    : undefined;

export interface MapPoint {
  city: string;
  stadium: string;
  lat: number;
  lng: number;
  notes?: string;
  rating?: "excellent" | "partial" | "none";
}

interface MapProps {
  points: MapPoint[];
  className?: string;
  height?: number;
  // Optional overrides for initial view (skip bounds fit when set)
  forceCenter?: LatLngExpression;
  forceZoom?: number;
  fitPadding?: number; // pixels padding when fitting bounds
}

const Map = ({ points, className, height = 400, forceCenter, forceZoom, fitPadding = 28 }: MapProps) => {
  // Render only on client to avoid Leaflet container reuse issues during hydration
  const [mounted, setMounted] = useState(false);
  const keyRef = useRef<string>(Math.random().toString(36).slice(2));
  useEffect(() => {
    setMounted(true);
    // No cleanup needed; react-leaflet handles unmount
  }, []);
  const bounds = useMemo(() => {
    if (forceCenter || !points.length) return null;
    const latLngs = points.map((point) => [point.lat, point.lng] as LatLngExpression);
    return L.latLngBounds(latLngs);
  }, [points, forceCenter]);

  const fallbackCenter: LatLngExpression = points.length
    ? ([points[0].lat, points[0].lng] as LatLngExpression)
    : ([0, 0] as LatLngExpression);

  if (!mounted) {
    return <div className={className} style={{ height }} />;
  }

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        key={(keyRef.current as unknown as string) || 'map'}
        bounds={bounds ?? undefined}
        boundsOptions={bounds ? { padding: [fitPadding, fitPadding] } : undefined}
        center={bounds ? undefined : (forceCenter ?? fallbackCenter)}
        scrollWheelZoom={false}
        zoom={forceCenter ? (forceZoom ?? 3) : 4}
        className="h-full w-full rounded-xl border border-neutral-200 shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker
            key={`${point.city}-${point.stadium}`}
            position={[point.lat, point.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{point.stadium}</div>
                <div className="text-sm text-neutral-600">{point.city}</div>
                {point.rating && (
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    Transit: {point.rating}
                  </div>
                )}
                {point.notes && <div className="text-xs text-neutral-600">{point.notes}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
