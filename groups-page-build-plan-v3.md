# World Cup 2026 — Groups Page Build Specification (v3)

## Purpose
Final alignment of the Groups Page implementation with the **Next.js App Router**, consistent file paths, clarified data ownership, and content guidelines.

---

## 1. App Router Alignment & Imports

### Correct Imports
All files should import using the unified project-root aliases:

```ts
import { groups } from "@/data/groups";
import Map from "@/components/Map";
import GroupTemplate from "@/app/groups/components/GroupTemplate";
```

✅ **Rule:** keep imports consistent with the `@/` root convention.

### Route Structure
| Route | File Path | Component Type |
|--------|------------|----------------|
| `/groups` | `web/app/groups/page.tsx` | Server Component |
| `/groups/[slug]` | `web/app/groups/[slug]/page.tsx` | Server Component (dynamic) |

Static generation uses:
- `generateStaticParams()` → 12 group pages (A–L)
- `generateMetadata()` → SEO + OG data
- `GroupTemplate` → shared rendering layout

---

## 2. Data Format (Canonical JSON/TS)

**Source:** `web/src/data/groups.ts`

Each group entry follows this schema:

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
  range_f?: [number, number]; // optional — include only if known
}

export interface MapCoord {
  city: string;
  lat: number;
  lng: number;
}

export interface GroupData {
  id: string; // "A"–"L"
  title: string;
  total_distance_miles: number;
  unique_cities: number;
  border_crossings: number;
  countries: string[];
  stadium_access: StadiumAccess[];
  climate_zones: ClimateZone[];
  complexity_rating: number; // 1–5
  summary: string;
  best_of_links: string[]; // e.g., ["/best-of/mexico-city"]
  map_coords?: MapCoord[]; // optional override if custom pins differ
  metaDescription: string;
}
```

### Climate Ranges
The original narratives provide descriptive temperatures only (e.g., “Hot & humid (75–90°F)”).
- ✅ The **content team may omit numeric ranges** if unknown.
- If possible, supply approximate ranges from NOAA/Wikipedia averages.
- `range_f` is **optional** — used for graph overlays later.

---

## 3. Canonical Map Data

### Data Ownership
- **Primary (canonical):** `venues.ts` — master coordinates for all stadiums.
- **Secondary:** `map_coords` in each group entry — optional override (subset or re-order).

Rule:
> The group page always pulls coordinates from `venues.ts` unless a `map_coords` override is present.

**Canonical file:**  
`web/src/data/venues.ts`

```ts
export interface Venue {
  city: string;
  stadium: string;
  lat: number;
  lng: number;
}
```

The `venues.ts` dataset powers `/groups`, `/venues`, and future `/stadiums` maps.

---

## 4. GroupTemplate Component Responsibilities

**File:** `web/app/groups/components/GroupTemplate.tsx`

### Type
Client component (`"use client";`) — required for the interactive map and any collapsible UI.

### Responsibilities
| Feature | Description |
|----------|-------------|
| **Hero Header** | Displays group name, flags, distance summary |
| **Stats Panel** | Quick facts (distance, cities, borders, complexity) |
| **Transit Table** | Lists stadiums + transit ratings (✅ ⚠️ ❌) |
| **Climate Section** | Shows per-city descriptions and optional temperature bars |
| **Map Section** | Renders Leaflet/Mapbox interactive map |
| **Best Of Section** | Renders cards linking to each `/best-of/[city]` page |
| **Navigation** | Buttons for “Compare Groups” and “View Teams in Group X” |

---

## 5. “Best Of” Link Format

### Expected Slug Format
All links must follow kebab-case city slugs:

```
/best-of/mexico-city
/best-of/atlanta
/best-of/guadalajara
```

If the project chooses the `/cities/` route instead, use identical slug formatting:

```
/cities/mexico-city
```

> Decision: **Slug = lowercase, words separated by hyphens, ASCII only.**

### Data Entry Example
```ts
best_of_links: [
  "/best-of/mexico-city",
  "/best-of/atlanta"
]
```

---

## 6. File Tree (Corrected)

```
web/
 ├── app/
 │   ├── groups/
 │   │   ├── page.tsx
 │   │   ├── [slug]/
 │   │   │   └── page.tsx
 │   │   └── components/
 │   │       └── GroupTemplate.tsx   # client component for layout + map
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

## 7. Map Implementation

- Uses Leaflet by default (OpenStreetMap tiles)
- Mapbox optional once token is added
- Map pulls coordinates via group-level overrides first, then canonical venues:

  ```ts
  const cityNames = group.stadium_access.map((s) => s.city);
  const coords = group.map_coords?.length
    ? group.map_coords
    : venues.filter((v) => cityNames.includes(v.city));
  ```
- Popups: stadium name, access rating, and climate note
- If `map_coords` provided, it overrides global venue coordinates

---

## 8. Summary of Changes vs v2

| Area | Change | Resolution |
|------|---------|-------------|
| Imports | Unified to `/src/...` | ✅ |
| Climate | `range_f` optional | ✅ |
| Map Data | Clarified canonical vs override | ✅ |
| GroupTemplate | Defined role + client status | ✅ |
| Best Of Slugs | Standardized kebab-case `/best-of/[city]` | ✅ |

---

**Prepared for:** World Cup Fan Zone Dev Team  
**Project:** Groups Page Integration (App Router v3)  
**Author:** Eric Chamberlin  
**Date:** November 2025
