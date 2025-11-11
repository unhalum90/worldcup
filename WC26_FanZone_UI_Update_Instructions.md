# WC26 Fan Zone — City Card & Stadium Page Enhancements
**Date:** November 5, 2025  
**Prepared for:** Dev Team  
**Prepared by:** Eric Chamberlin  

---

## Overview
This sprint update improves visual appeal, UX, and interactivity on the **City Cards** and **Stadium Detail Pages**:

1. Replace placeholder stadium SVGs with creative map or skyline visuals.  
2. Display confirmed match dates in a structured table.  
3. Integrate stadium maps (Leaflet or pre-rendered city maps).  
4. Update the “Get Notified” CTA to promote newsletter subscription.

---

## 1. Replace Stadium SVG (City Cards)

### Objective
Replace the generic stadium SVG with city-specific visuals (map thumbnails or skyline silhouettes).

### Implementation
**Preferred Source:** `/public/world_cup_maps/[city].jpg`  

**Steps:**
1. In the city card component (`CityCard.tsx` or equivalent):
   ```tsx
   <Image
     src={`/world_cup_maps/${city.slug}.jpg`}
     alt={`${city.name} Fan Zone Map`}
     width={120}
     height={120}
     className="rounded-lg object-cover shadow-md"
     onError={(e) => { e.currentTarget.src = '/images/default_stadium.jpg'; }}
   />
   ```
2. Add gradient overlay for readability:
   ```css
   .city-card::after {
     content: "";
     position: absolute;
     inset: 0;
     background: linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0));
     border-radius: 12px;
   }
   ```

---

## 2. Display Match Dates (Replace “Coming Soon” Calendar)

### Objective
Use known FIFA 2026 match data to show real dates and stages under stadium names.

### Implementation
1. Add JSON file `/data/match_dates.json`:
   ```json
   {
     "atlanta": {
       "stadium": "Mercedes-Benz Stadium",
       "matches": [
         { "date": "June 15, 2026", "stage": "Group Stage", "kickoff": "18:00" },
         { "date": "June 24, 2026", "stage": "Round of 32", "kickoff": "21:00" }
       ]
     }
   }
   ```

2. In `StadiumPage.tsx`:
   ```tsx
   import matchDates from "@/data/match_dates.json";
   const stadiumData = matchDates[citySlug];
   ```

3. Replace existing block:
   ```tsx
   {stadiumData ? (
     <table className="w-full text-center text-sm mt-4 border-collapse">
       <thead>
         <tr className="bg-gray-100">
           <th className="p-2">Date</th>
           <th className="p-2">Stage</th>
           <th className="p-2">Kickoff</th>
         </tr>
       </thead>
       <tbody>
         {stadiumData.matches.map((m, i) => (
           <tr key={i} className="border-b">
             <td className="p-2">{m.date}</td>
             <td className="p-2">{m.stage}</td>
             <td className="p-2">{m.kickoff}</td>
           </tr>
         ))}
       </tbody>
     </table>
   ) : (
     <div className="text-center text-gray-500 mt-2">Schedule not yet available</div>
   )}
   ```

---

## 3. Integrate Maps (Leaflet or Pre-rendered City Maps)

### Objective
Replace “Interactive Map Coming Soon” with static or interactive maps.

### Option A — Static Maps (Preferred)
```tsx
<Image
  src={`/world_cup_maps/${city.slug}_map.jpg`}
  alt={`${city.name} Stadium Map`}
  width={800}
  height={400}
  className="rounded-xl shadow-lg object-cover"
/>
<p className="text-center mt-2">
  Coordinates: {stadium.coordinates.lat}, {stadium.coordinates.lng} • 
  <a href={`https://maps.google.com/?q=${stadium.coordinates.lat},${stadium.coordinates.lng}`} target="_blank" className="text-blue-600 underline">Open in Google Maps</a>
</p>
```

### Option B — Leaflet (v2 or Progressive Enhancement)
```bash
npm install react-leaflet leaflet
```
```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function StadiumMap({ lat, lng, name }) {
  return (
    <MapContainer center={[lat, lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
```
Replace placeholder with:
```tsx
<StadiumMap lat={33.7554} lng={-84.4008} name="Mercedes-Benz Stadium" />
```

---

## 4. Update “Get Notified” CTA → Newsletter Subscription

### Objective
Replace the current call-to-action block with a newsletter subscription invitation.

### Implementation
Locate the CTA component (likely `WaitlistBanner.tsx` or section in `StadiumPage.tsx`).

**Replace existing block:**
```tsx
<section className="bg-gradient-to-r from-purple-600 to-blue-600 text-center text-white py-10 rounded-xl">
  <h2 className="text-2xl font-semibold mb-2">Subscribe to Free Newsletter</h2>
  <p className="mb-4 text-sm opacity-90">
    Get notified when the <strong>{city.name}</strong> guide becomes available after the Official Draw.
  </p>
  <Link href="/newsletter" className="inline-block bg-white text-purple-700 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition">
    Subscribe Now →
  </Link>
</section>
```

**Notes:**
- Text change: “Join our waitlist…” → “Subscribe to free newsletter to get notified when available.”  
- Button link: `/newsletter` (MailerLite or internal subscription route).  
- Maintain gradient style for consistency.

---

## Deliverables Summary

| Task | File(s) | Description |
|------|----------|-------------|
| 1 | `CityCard.tsx` | Replace stadium SVG with map/skyline image |
| 2 | `match_dates.json`, `StadiumPage.tsx` | Display match table with actual dates |
| 3 | `StadiumMap.tsx` or static map image | Add interactive/static stadium maps |
| 4 | `WaitlistBanner.tsx` | Update CTA to newsletter subscription link |

---

## QA Checklist

- [ ] City thumbnails load correctly from `/world_cup_maps`  
- [ ] Match tables render properly on all stadium pages  
- [ ] Map (static or Leaflet) displays correct coordinates  
- [ ] CTA text updated to newsletter subscription  
- [ ] CTA link directs to `/newsletter` (functional)  
- [ ] All updates responsive and mobile-optimized  

---

**End of File**
