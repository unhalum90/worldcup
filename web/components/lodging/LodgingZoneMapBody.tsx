'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useMemo } from 'react';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { latLngBounds, type LatLngBoundsLiteral } from 'leaflet';
import type { LodgingMapMarker } from '@/types/lodging';

interface LodgingZoneMapBodyProps {
  markers: LodgingMapMarker[];
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a>';

function FitBounds({ bounds }: { bounds: LatLngBoundsLiteral }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) return;
    const leafletBounds = latLngBounds(bounds);
    if (!leafletBounds.isValid()) return;

    // Avoid fighting user interaction by only fitting once on mount.
    map.fitBounds(leafletBounds.pad(0.25), { animate: false, maxZoom: 13 });
  }, [bounds, map]);

  return null;
}

function buildBounds(markers: LodgingMapMarker[]): LatLngBoundsLiteral {
  if (!markers.length) {
    return [
      [0, 0],
      [0, 0],
    ];
  }
  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // Handle single point by adding a slight delta so fitBounds behaves.
  if (minLat === maxLat && minLng === maxLng) {
    const delta = 0.01;
    return [
      [minLat - delta, minLng - delta],
      [maxLat + delta, maxLng + delta],
    ];
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

function markerRadius(marker: LodgingMapMarker) {
  const base = marker.highlight ? 16 : 12;
  const score = Number(marker.matchScore ?? 0);
  if (Number.isNaN(score)) return base;
  return base + Math.min(8, Math.floor(score / 10));
}

export default function LodgingZoneMapBody({ markers }: LodgingZoneMapBodyProps) {
  const bounds = useMemo(() => buildBounds(markers), [markers]);
  const center = useMemo(() => {
    if (!markers.length) return [39.8283, -98.5795] as [number, number]; // Fallback to US centroid.
    return [markers[0].lat, markers[0].lng] as [number, number];
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-3xl overflow-hidden"
      attributionControl={false}
      preferCanvas
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FitBounds bounds={bounds} />
      {markers.map((marker) => (
        <MarkerGlow key={`${marker.name}-glow`} marker={marker} />
      ))}
      {markers.map((marker) => (
        <CircleMarker
          key={marker.name}
          center={[marker.lat, marker.lng]}
          radius={markerRadius(marker)}
          color={marker.highlight ? '#fb923c' : '#fb7185'}
          weight={2}
          opacity={1}
          fillOpacity={0.85}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            <div className="text-xs">
              <p className="font-semibold text-gray-900">{marker.name}</p>
              <p className="text-gray-700">{marker.matchScore}% match</p>
              {marker.travelTimeToStadium && (
                <p className="text-gray-700">Stadium: {marker.travelTimeToStadium}</p>
              )}
              {marker.travelTimeToFanFest && (
                <p className="text-gray-700">Fan Fest: {marker.travelTimeToFanFest}</p>
              )}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function MarkerGlow({ marker }: { marker: LodgingMapMarker }) {
  const gradientSteps = marker.highlight ? [0.05, 0.1, 0.2] : [0.03, 0.08, 0.15];
  const baseRadius = markerRadius(marker) * 2.2;

  return (
    <>
      {gradientSteps.map((step, idx) => (
        <Circle
          key={`${marker.name}-halo-${idx}`}
          center={[marker.lat, marker.lng]}
          radius={baseRadius * (idx + 1)}
          pathOptions={{
            stroke: false,
            fillOpacity: Math.max(0.08, 0.2 - step * idx),
            fillColor: marker.highlight ? '#fb923c' : '#fb7185',
          }}
        />
      ))}
    </>
  );
}
