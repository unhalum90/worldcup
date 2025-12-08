'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { VenueExtended } from '@/src/data/venuesExtended';

// Fix Leaflet default marker icon issue in Next.js
const stadiumIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface StadiumMapProps {
  venue: VenueExtended;
  className?: string;
}

function getTransitColor(transit: VenueExtended['transit']): string {
  switch (transit) {
    case 'EXCELLENT': return 'text-green-600';
    case 'GOOD': return 'text-blue-600';
    case 'LIMITED': return 'text-yellow-600';
    case 'NONE': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export default function StadiumMap({ venue, className = '' }: StadiumMapProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 ${className}`}>
      <MapContainer
        center={[venue.lat, venue.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-64 w-full"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[venue.lat, venue.lng]} icon={stadiumIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{venue.stadium}</p>
              <p className="text-gray-600">{venue.city}</p>
              <p className="text-gray-500 text-xs mt-1">
                TRANSIT: <span className={`font-medium ${getTransitColor(venue.transit)}`}>{venue.transit}</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">{venue.transitNote}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
