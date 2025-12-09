'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom icons using emoji markers via divIcon
const createEmojiIcon = (emoji: string, size: number = 28) => {
  return L.divIcon({
    html: `<div style="font-size: ${size}px; line-height: 1;">${emoji}</div>`,
    className: 'emoji-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const icons = {
  stadium: createEmojiIcon('🏟️', 32),
  airport: createEmojiIcon('✈️', 26),
  fanFest: createEmojiIcon('🎉', 26),
  lodging: createEmojiIcon('🏨', 22),
};

export interface MapMarker {
  lat: number;
  lng: number;
  type: 'stadium' | 'airport' | 'fanFest' | 'lodging';
  name: string;
  description?: string;
}

interface MatchMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export default function MatchMap({ 
  markers, 
  center,
  zoom = 12, 
  className = '' 
}: MatchMapProps) {
  // Default center to first marker (usually stadium) if not provided
  const mapCenter = center || (markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 0, lng: 0 });

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 ${className}`}>
      <style jsx global>{`
        .emoji-marker {
          background: transparent;
          border: none;
        }
      `}</style>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-96 w-full"
        attributionControl={true}
      >
        {/* CartoDB Positron - clean, minimal basemap for better icon visibility */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker, index) => (
          <Marker 
            key={`${marker.type}-${index}`}
            position={[marker.lat, marker.lng]} 
            icon={icons[marker.type]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{marker.name}</p>
                {marker.description && (
                  <p className="text-gray-600 text-xs mt-1">{marker.description}</p>
                )}
                <p className="text-gray-400 text-xs mt-1 capitalize">{marker.type.replace('fanFest', 'Fan Festival')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="bg-gray-50 px-4 py-2 flex flex-wrap gap-4 text-xs text-gray-600">
        <span>🏟️ Stadium</span>
        <span>✈️ Airport</span>
        <span>🎉 Fan Fest</span>
        <span>🏨 Lodging Zones</span>
      </div>
    </div>
  );
}
