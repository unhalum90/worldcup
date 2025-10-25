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
- `NEXT_PUBLIC_ENABLE_ONBOARDING=true` to toggle gating (default off in dev).

**Acceptance**
- Migrations run cleanly.  
- RLS blocks cross-user reads.  
- API responds `401` when no auth.

---

### 🧭 Sprint 1 — Onboarding UI + Persistence (1.5–2 days)

**Routes**
- `/onboarding` (client) → 3-step wizard:  
  - **Step 1:** `home_city`, `home_airport`, `group_size`, `children`, `seniors`, `mobility_issues`  
  - **Step 2:** `budget_level`, `comfort_preference`, `food/nightlife/climate`  
  - **Step 3:** `travel_focus`, `preferred_transport`, `favorite_team` (optional)

**Components**
- Reuse `AirportAutocomplete` and `MAJOR_AIRPORTS` from `airportData.ts`  
- Add progress bar + stepper (matching Trip Builder style)

**Behavior**
- Save partial state locally; submit once at end via `PUT /api/profile`  
- On success, set cookie `wc26-onboarded=true`; show “All set” confirmation with CTA to open planner  

**Gating (optional, flag-based)**
- In `middleware.ts`, if `NEXT_PUBLIC_ENABLE_ONBOARDING=true` and user authenticated but no profile/cookie → redirect to `/onboarding`  
- Allowlist: `/login`, `/api/*`, static assets, guides, onboarding routes  

**Account Edit**
- `/account/profile` → fetch `GET /api/profile` and allow edits via `PUT /api/profile`  

**Validation**
- IATA: must be valid 3-letter code in `airportData`  
- Enums: enforce allowed values  
- `home_airport`: store `{ code, name, city, country }` JSONB

**Acceptance**
- New user completes onboarding in <45s  
- Planners prefill from profile on reload  
- RLS confirmed with blocked cross-user reads

---

### 🚀 Sprint 2 — Planner Integrations + QA Polish (1–1.5 days)

**Trip Builder Integration**
- Read profile via Supabase SSR before generating prompt  
- Merge `context = { ...profile, ...formData }` (form overrides profile)  
- Default to `profile.home_airport` if no `originAirport`  

**Flight Planner Integration**
- Default origin to `profile.home_airport.code`  
- Bias scoring using `budget_level` + `comfort_preference`  

**Lodging Planner (future)**
- Read profile to adjust zone scoring by comfort/budget/nightlife/mobility  

**Analytics**
- Fire `onboarding_completed` event with non-PII fields (`budget_level`, `preferred_transport`)  

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
| `children` | INT DEFAULT 0 | |
| `seniors` | INT DEFAULT 0 | |
| `mobility_issues` | BOOLEAN DEFAULT false | |
| `budget_level` | ENUM('budget','moderate','premium') | |
| `comfort_preference` | ENUM('budget_friendly','balanced','luxury_focus') | |
| `food_preference` | ENUM('local_flavors','international','mix') | |
| `nightlife_preference` | ENUM('quiet','social','party') | |
| `climate_preference` | ENUM('avoid_heat','open_to_hot','prefer_warm') | |
| `travel_focus` | TEXT[] CHECK subset | |
| `preferred_transport` | ENUM('public','car','mixed') | |
| `languages` | TEXT[] NULL | ISO 639-1 codes |
| `currency` | TEXT NULL | |
| `favorite_team` | TEXT NULL | |
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

- `/db/migrations/009_user_profile.sql`  
- `/db/migrations/010_trip_plans_view.sql` or `_table.sql`  
- `/api/profile/route.ts` (GET/PUT)  
- `/api/onboarding/complete/route.ts` (POST)  
- `/onboarding/page.tsx` (wizard)  
- `/account/profile/page.tsx` (edit form)  
- `/lib/profile/api.ts` (client helpers)  
- `middleware.ts` (gating logic)  
- `README.md` updates  

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
