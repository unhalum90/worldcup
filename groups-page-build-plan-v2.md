# World Cup 2026 — Groups Page Build Specification (v2)

## Purpose
Refines the Groups Page integration plan to align with the **App Router architecture** (`web/app/...`) and to define concrete data structures, routes, and dependencies.

---

## 1. App Router Alignment

### Route Structure
Replace legacy `/pages` references with **App Router routes**:

| Route | File Path | Component Type |
|--------|------------|----------------|
| `/groups` | `web/app/groups/page.tsx` | Server Component |
| `/groups/[slug]` | `web/app/groups/[slug]/page.tsx` | Server Component (dynamic) |

### Static Generation
Use the following App Router methods:
- **`generateStaticParams()`** → Prebuild 12 group pages (`A–L`)
- **`generateMetadata()`** → Create per-group SEO metadata (title, description, og:image)
- **`fetchGroupsData()`** → Import JSON/TS dataset statically at build time

Example:

```ts
// web/app/groups/[slug]/page.tsx
import { groups } from "@/data/groups";
import Map from "@/components/Map";

export async function generateStaticParams() {
  return groups.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }) {
  const group = groups.find((g) => g.id === params.slug);
  return {
    title: `${group.title} — World Cup 2026 Travel Guide`,
    description: group.metaDescription,
    openGraph: {
      title: group.title,
      images: [`/images/groups/${group.id}.jpg`],
    },
  };
}

export default function GroupPage({ params }) {
  const group = groups.find((g) => g.id === params.slug);
  return <GroupTemplate data={group} />;
}
```

---

## 2. Data Format (Canonical JSON/TS)

### Source
**Path:** `web/src/data/groups.ts`

Data must be **typed JSON or TypeScript**, not Markdown.  
Each group entry will conform to this schema:

```ts
export interface StadiumAccess {
  city: string;
  stadium: string;
  rating: "excellent" | "partial" | "none";
  notes: string;
}

export interface ClimateZone {
  city: string;
  climate: string;
  range_f: [number, number];
}

export interface GroupData {
  id: string;               // "A", "B", etc.
  title: string;            // "Mexico + Atlanta"
  total_distance_miles: number;
  unique_cities: number;
  border_crossings: number;
  countries: string[];
  stadium_access: StadiumAccess[];
  climate_zones: ClimateZone[];
  complexity_rating: number; // 1–5
  summary: string;
  best_of_links: string[];
  map_coords: { city: string; lat: number; lng: number }[];
  metaDescription: string;
}
```

**Implementation detail:**  
- Keep this data in a static file (`groups.ts`) imported directly by pages at build time.  
- Remove references to `scripts/convertGroups.js`; no conversion needed.

---

## 3. Map Integration

### Data Source
Create or reuse:
`web/src/data/venues.ts`

Each venue entry:
```ts
export interface Venue {
  city: string;
  stadium: string;
  lat: number;
  lng: number;
}
```

If coordinates are missing, add approximate city-center lat/lngs.  
This data file powers both `/groups` and `/venues` maps.

### Implementation
Use **Mapbox GL JS** or **Leaflet**, pulling from `map_coords` array for each group.
If Mapbox token is not configured:
- Default to Leaflet with OpenStreetMap tiles
- OG images (map snapshots) can be deferred or replaced by static images under `/public/images/groups/`

---

## 4. "Best Of" Links Resolution

### Options
**Option A (preferred):**  
Stub `/best-of/[city]` routes now for SEO continuity.  
Each page can simply render “Coming Soon” until content ready.

**Option B (fallback):**  
Change links to `/cities/[city]` where guides already exist.

Decision required:  
→ **Confirm whether `/best-of/` pages should be scaffolded (empty for now).**

---

## 5. File Structure Summary

```
web/
 ├── app/
 │   ├── groups/
 │   │   ├── page.tsx
 │   │   ├── [slug]/
 │   │   │   └── page.tsx
 │   │   └── components/
 │   │       └── GroupTemplate.tsx
 │   └── teams/
 │       └── page.tsx
 ├── src/
 │   ├── data/
 │   │   ├── groups.ts
 │   │   └── venues.ts
 │   └── components/
 │       └── Map.tsx
 └── public/
     └── images/groups/*.jpg
```

---

## 6. Build & SEO Strategy

- **SSG:** Build all 12 pages at build time (fast render)
- **SEO metadata:** Defined per group in `generateMetadata`
- **OG images:** `/public/images/groups/{group}.jpg` or map screenshots
- **Internal links:**  
  - `/teams?group=A`  
  - `/groups` (back link)
  - `/best-of/...` (stubbed or redirected)

---

## 7. Dependencies

| Area | Dependency | Status |
|------|-------------|--------|
| Routing | App Router | ✅ Ready |
| Data | `groups.ts`, `venues.ts` | 🟡 To create |
| Maps | Mapbox or Leaflet | 🟡 Decide based on token availability |
| Best Of pages | `/best-of/[city]` | 🔴 Missing — decision required |
| OG Images | Static assets | 🟡 Placeholder ready |

---

## 8. Implementation Tasks

| # | Task | Owner | Priority |
|---|------|--------|----------|
| 1 | Create `groups.ts` dataset (12 entries) | Content team | 🔥 |
| 2 | Create `venues.ts` with coordinates | Dev | 🔥 |
| 3 | Scaffold `/app/groups/[slug]/page.tsx` | Dev | 🔥 |
| 4 | Implement `generateStaticParams` and `generateMetadata` | Dev | 🔥 |
| 5 | Build `GroupTemplate.tsx` component | Dev | 🔥 |
| 6 | Add `/best-of/[city]` stubs or change links | PM decision | ⚠️ |
| 7 | Integrate Leaflet/Mapbox map | Dev | ⚠️ |
| 8 | Add OG images | Design | ⚠️ |
| 9 | Test builds & validate SSG | QA | ⚠️ |

---

## 9. Open Questions (to resolve before sprint)

1. ✅ **Data format:** JSON/TS (confirmed)  
2. ⚠️ **Best Of routing:** Scaffold or redirect?  
3. ⚠️ **Map provider:** Leaflet fallback or wait for Mapbox token?  
4. ⚠️ **OG image generation:** static or programmatic?

---

**Prepared for:** World Cup Fan Zone Dev Team  
**Project:** Groups Page Integration (App Router v2)  
**Author:** Eric Chamberlin  
**Date:** November 2025
