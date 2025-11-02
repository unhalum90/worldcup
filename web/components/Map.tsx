"use client";

import { useMemo } from "react";
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
}

const Map = ({ points, className, height = 400 }: MapProps) => {
  const bounds = useMemo(() => {
    if (!points.length) {
      return null;
    }

    const latLngs = points.map((point) => [point.lat, point.lng] as LatLngExpression);
    return L.latLngBounds(latLngs);
  }, [points]);

  const fallbackCenter: LatLngExpression = points.length
    ? ([points[0].lat, points[0].lng] as LatLngExpression)
    : ([0, 0] as LatLngExpression);

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        bounds={bounds ?? undefined}
        center={bounds ? undefined : fallbackCenter}
        scrollWheelZoom={false}
        zoom={4}
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
