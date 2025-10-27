# 🧭 Sprint Plan — User Profile Onboarding System
**Project:** World Cup Fan Zone  
**Version:** 1.0  
**Date:** Oct 25, 2025  
**Owner:** Eric Chamberlin / Fan Zone Network

---

## 🎯 Scope Summary

- One persistent profile per authenticated user  
- Three-step onboarding flow (**Basics → Style → Interests**)  
- RLS-protected Supabase tables  
- Unified context loading so planners auto-fill from the profile  
- Optional gating to nudge new users through onboarding  

---

## 📣 Status Update — Oct 25, 2025

- Sprint 0: COMPLETE
  - Added migrations: `009_user_profile.sql` (base table + RLS) and `010_profile_updates_children_tickets_climate.sql` (children buckets, tickets, new climate enum check)
  - API contracts implemented: `GET/PUT /api/profile`, `POST /api/onboarding/complete`
  - RLS owner policies in place; SSR auth validated
- Sprint 1: COMPLETE (+ adjustments from UX review)
  - Onboarding wizard `/onboarding` shipped with membership-aware handoff (`?from=membership&redirect=...`)
  - Children split into two buckets: 0–5 and 6–18 (legacy `children` kept server-side as sum)
  - Removed Comfort Preference (Budget only)
  - Climate options reworded: `all`, `prefer_northerly`, `comfortable`
  - Added tickets capture: `has_tickets` + `ticket_match { country, city, stadium, date, match }`
  - Edit page `/account/profile` added with full parity
  - Optional gating added behind `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE`
- Build/QA
  - Next.js build passes; routes live: `/onboarding`, `/account/profile`, `/api/profile`, `/api/onboarding/complete`
  - Cookie `wc26-onboarded` set on completion to suppress prompts

What’s next (Sprint 2): integrate profile defaults into Trip Builder/Flight Planner, bias with budget + climate + kids + tickets, add light analytics + i18n copy.

---

## ⚙️ Delivery Plan — 3 Sprints

### 🧩 Sprint 0 — Foundations (0.5 day)

**Objectives**
- Database migrations  
- Security setup (RLS)  
- Initial API contracts

**Tasks**
- Create `user_profile` table with enums, JSONB for `home_airport`, updated_at trigger, and indices.  
- `trip_plans`: spec calls it `trip_plans`; code today persists to `travel_plans` (Trip Builder).  

**Options**
- **Option A (Least Risky):** keep `travel_plans` for Trip Builder; create `trip_plans` as a Postgres VIEW over `travel_plans` with compatible columns.  
- **Option B:** create `trip_plans` table and gradually migrate Trip Builder write path behind a feature flag.

**RLS**
- Enable RLS on `user_profile` and `trip_plans`.  
- Simple owner policies: `auth.uid() = user_id`.

**Contracts (API Shapes)**
- `GET /api/profile` → 200 `{ profile }` | 204 if none  
- `PUT /api/profile` → 200 `{ profile }` | 401 unauth | 422 validation  
- `POST /api/onboarding/complete` → 200 `{ done: true }` (sets cookie `wc26-onboarded=true`)  

**Flags**
- `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE=true` to enable gentle onboarding redirects for active members without a profile (default off).

**Acceptance**
- Migrations run cleanly.  
- RLS blocks cross-user reads.  
- API responds `401` when no auth.

---

### 🧭 Sprint 1 — Onboarding UI + Persistence (1.5–2 days)

**Routes**
- `/onboarding` (client) → 3-step wizard:  
  - **Step 1:** `home_city`, `home_airport`, `group_size`, `children_0_5`, `children_6_18`, `seniors`, `mobility_issues`, `has_tickets`, `ticket_match`  
  - **Step 2:** `budget_level`, `food/nightlife/climate`  
  - **Step 3:** `travel_focus`, `preferred_transport`, `favorite_team` (optional)

**Components**
- Reuse `AirportAutocomplete` and `MAJOR_AIRPORTS` from `airportData.ts`  
- Add progress bar + stepper (matching Trip Builder style)

**Behavior**
- Save partial state locally; submit once at end via `PUT /api/profile`  
- On success, set cookie `wc26-onboarded=true`; show “All set” confirmation with a CTA that honors optional `?redirect=`  
- Membership handoff supported: after checkout send users to `/onboarding?from=membership&redirect=/planner/trip-builder`

**Gating (optional, flag-based)**
- In `middleware.ts`, if `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE=true` and user is authenticated, an active member, and lacks a profile/cookie → redirect to `/onboarding?from=membership&redirect=<original>`  
- Allowlist: `/login`, `/api/*`, static assets, guides, onboarding routes  

**Account Edit**
- `/account/profile` → fetch `GET /api/profile` and allow edits via `PUT /api/profile`  

**Validation**
- IATA: must be valid 3-letter code in `airportData`  
- Enums: enforce allowed values  
- `home_airport`: store `{ code, name, city, country }` JSONB

**Acceptance**
- New user completes onboarding in <45s  
- Planners prefill from profile on reload (defaults will be wired in Sprint 2)  
- RLS confirmed with blocked cross-user reads

---

### 🚀 Sprint 2 — Planner Integrations + QA Polish (1–1.5 days)

**Trip Builder Integration**
- Read profile via Supabase SSR before generating prompt  
- Merge `context = { ...profile, ...formData }` (form overrides profile)  
- Default to `profile.home_airport` if no `originAirport`  
- If `has_tickets` + `ticket_match`, bias date/city selection around that match  
- Use children buckets to bias family-friendly activities

**Flight Planner Integration**
- Default origin to `profile.home_airport.code`  
- Bias scoring using `budget_level`, `climate_preference`, kids buckets, and `ticket_match` proximity  

**Lodging Planner (future)**
- Read profile to adjust zone scoring by comfort/budget/nightlife/mobility  

**Analytics**
- Fire `onboarding_completed` event with non-PII fields (e.g., `budget_level`, `preferred_transport`, `climate_preference`, presence of kids bucket, presence of tickets)

**i18n**
- Add onboarding copy to `messages/en.json` and `messages/fr.json`  

**Docs**
- Update `web/README.md`: onboarding flag, routes, API, integration notes  

**Acceptance**
- Trip Builder + Flight Planner pick defaults from profile  
- Functionality preserved when profile missing  
- Gating toggled via flag without redeploy  

---

## 🗃️ Data Model Details

### Table: `user_profile`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `user_id` | UUID unique (FK → auth.users) | |
| `home_city` | TEXT | |
| `home_airport` | JSONB `{ code, name, city, country }` | |
| `group_size` | INT DEFAULT 1 | |
| `children` | INT DEFAULT 0 | Legacy aggregate (server derives from buckets) |
| `children_0_5` | INT DEFAULT 0 | |
| `children_6_18` | INT DEFAULT 0 | |
| `seniors` | INT DEFAULT 0 | |
| `mobility_issues` | BOOLEAN DEFAULT false | |
| `budget_level` | ENUM('budget','moderate','premium') | |
| `food_preference` | ENUM('local_flavors','international','mix') | |
| `nightlife_preference` | ENUM('quiet','social','party') | |
| `climate_preference` | ENUM('all','prefer_northerly','comfortable') | |
| `travel_focus` | TEXT[] CHECK subset | |
| `preferred_transport` | ENUM('public','car','mixed') | |
| `languages` | TEXT[] NULL | ISO 639-1 codes |
| `currency` | TEXT NULL | |
| `favorite_team` | TEXT NULL | |
| `has_tickets` | BOOLEAN DEFAULT false | |
| `ticket_match` | JSONB `{ country, city, stadium, date, match }` | |
| `created_at` / `updated_at` | timestamptz | Trigger updates both |
| Indices | unique (user_id), gin (languages, travel_focus) | |

### View/Table: `trip_plans`
- Option A: Create VIEW over `travel_plans` with mapped columns  
- Option B: Create new `trip_plans` table and migrate behind feature flag  

**RLS Policies**
```sql
USING (auth.uid() = user_id)
CHECK (auth.uid() = user_id)
```

---

## 🔒 Security & QA

- Test unauthorized API → `401`  
- Test invalid enum/IATA → `422`  
- Confirm RLS blocks cross-user reads  
- Manual flow validation for both flag states (on/off)  

---

## 🧱 Deliverables

- [x] `/db/migrations/009_user_profile.sql`  
- [x] `/db/migrations/010_profile_updates_children_tickets_climate.sql`  
- [ ] `/db/migrations/010_trip_plans_view.sql` or `_table.sql` (if we do the view/table for Trip Builder)  
- [x] `/api/profile/route.ts` (GET/PUT)  
- [x] `/api/onboarding/complete/route.ts` (POST)  
- [x] `/onboarding/page.tsx` (wizard)  
- [x] `/account/profile/page.tsx` (edit form)  
- [ ] `/lib/profile/api.ts` (client helpers; optional)  
- [x] `middleware.ts` (optional gating logic behind env flag)  
- [x] `web/README.md` updates  

---

## ⏱️ Sequencing and Effort

| Sprint | Duration | Focus |
|---------|-----------|--------|
| 0 | 0.5 day | Migrations + RLS + API skeleton |
| 1 | 1.5–2 days | UI + persistence |
| 2 | 1–1.5 days | Integrations + QA |
| **Total** | **~3–4 days** | Feature complete and integrated |

---

## 🧠 Assumptions

- Trip Builder continues using `travel_plans` (no disruption).  
- `home_airport` uses `AirportAutocomplete` and `MAJOR_AIRPORTS`.  
- Later enhancement: backend airport search via `airports.csv` for completeness.

---

## ✅ Readiness Verdict

| Area | Status | Notes |
|------|---------|-------|
| Database design | ✅ | Safe; low migration risk |
| API design | ✅ | Minimal, composable |
| Security (RLS) | ✅ | Enforced owner-only access |
| Onboarding UX | ✅ | Fast and consistent |
| Integration plan | ✅ | Fully mapped |
| QA coverage | ⚙️ | Manual + light automated tests |

**Verdict:** ✅ Approved for implementation — proceed with Sprint 0 setup before resuming Flight Planner work.

---

**End of Plan**
