# WC26 Trip Builder Lead Magnet — Dev Notes

Audience: dev-to-dev walkthrough of how the **onboarding profile**, **trip builder UI**, and **AI backend** fit together to generate personalized itineraries. This is the “lead magnet” engine that turns anonymous traffic into high‑intent trip plans.

---

## 1. High-Level Flow

1. **Onboarding (`/onboarding`)**
   - Collects structured traveler profile + ticket context.
   - Persists to `user_profile` in Supabase.
   - Caches ticket selections in `localStorage` for anonymous / pre‑login flows.
2. **Trip Builder (`/planner/trip-builder`)**
   - Loads the user’s profile from Supabase.
   - Shows a human-readable summary (ProfileReview).
   - Collects trip-specific intent (dates, cities, notes, ticket cities/matches).
   - Builds a `TravelPlanRequest` payload by merging profile defaults with form data.
   - POSTs to `/api/travel-planner`.
3. **AI Backend (`/api/travel-planner`)**
   - Loads the user profile again (authoritative copy).
   - Merges profile + form into `TravelPlanRequestV2`.
   - Hydrates with match schedule + city metadata from Supabase.
   - Builds a constrained prompt for Gemini and returns structured itinerary JSON.

You can think of it as:

> Profile (who you are)  
> + Trip intent (when/where you’re going)  
> + World Cup context (cities + matches)  
> → AI prompt → 2–3 complete itineraries.

---

## 2. Profile Capture (Onboarding)

**Key files**

- `web/app/onboarding/page.tsx`
- `web/lib/profile/types.ts`
- `db/migrations/009_user_profile.sql`
- `db/migrations/010_profile_updates_children_tickets_climate.sql`

**What we store**

Onboarding writes a `UserProfile` row with:

- Home base
  - `home_airport` (code, name, city, country) OR `home_city`.
- Group composition
  - `group_size`, `children_0_5`, `children_6_18`, `seniors`, `mobility_issues`.
- Travel style
  - `budget_level` (`budget | moderate | premium`)
  - `food_preference` (`local_flavors | international | mix`)
  - `nightlife_preference` (`quiet | social | party`)
  - `climate_preference` (`all | prefer_northerly | comfortable`)
- Focus & transport
  - `travel_focus` (array: `fanfest`, `stadium_experience`).
  - `preferred_transport` (`public | car | mixed`).
- Ticket context
  - `has_tickets`
  - `ticket_match` (nested object: `{ country, city, stadium, date, match }`).

The onboarding component:

- Keeps rich form state in React.
- On submit, builds a JSON body that matches `UserProfile` fields.
- Writes:
  - `user_profile` row (for logged-in users).
  - `localStorage['fz_onboarding_ticket_matches']` (array of `MatchItem`) for reuse even if the user isn’t logged in yet.

This separation is important: **profile is durable** (DB) while **ticket matches** can survive anonymous → signup → planner flows via `localStorage`.

---

## 3. Trip Builder UI (Front-End)

**Key files**

- `web/app/planner/trip-builder/page.tsx`
- `web/app/planner/trip-builder/TripBuilderClient.tsx`
- `web/components/trip-planner/ProfileReview.tsx`
- `web/components/trip-planner/TripIntentForm.tsx`
- `web/components/MatchPicker.tsx`

### 3.1 ProfileReview — sanity check before AI

`ProfileReview` takes a `UserProfile` and renders:

- Home summary (`home_airport` / `home_city`).
- Group summary (adults, kids, seniors, mobility).
- Travel style (budget, food, nightlife, climate).
- Transport preference.
- Ticket summary (if `has_tickets` + `ticket_match`).

This is a pure formatter layer — no writes, just string building. It’s the “confirm your profile” step before the user invests in a plan.

### 3.2 TripIntentForm — collects trip-specific inputs

`TripIntentForm` does the heavy lifting:

- `TravelPlanRequest` type (client-side):
  - `originCity`, `originAirport`
  - `groupSize`, `children`, `seniors`, `mobilityIssues`
  - `citiesVisiting[]`
  - `transportMode`, `budgetLevel`
  - `startDate`, `endDate`
  - `personalContext` (free-text notes)
  - `hasMatchTickets`, `matchDates[]`, `ticketCities[]`
  - `tripFocus[]`, `surpriseMe`, *comfort/nightlife/food/climate preferences*
  - `locale`

- Defaults from profile / localStorage:
  - `defaultCities` = union of `profile.ticket_match.city` + `storedTicketMatches[].city`.
  - `defaultMatchSelections` = derived from `createMatchKey(city, date)` for profile + stored matches.
  - Pre-populates `citiesVisiting`, `ticketCities`, and `matchSelections` when possible.

- `buildPayloadFromProfile(profile)`:
  - Converts `UserProfile` into the base `TravelPlanRequest`:
    - `originCity`, `originAirport`
    - group, children, seniors, mobility
    - `transportMode`, `budgetLevel`
    - ticket defaults (`ticketCities`, `matchDates`) and `tripFocus`
    - food/nightlife/climate preferences
  - Sets placeholders for `citiesVisiting`, `startDate`, `endDate` — these are filled from the form.

- On submit:
  - Validates date order + required fields.
  - Builds `matchDates` from `matchSelections` (`extractDateFromMatchKey`).
  - Calls `onSubmit(payload)` with the merged result.

### 3.3 TripBuilderClient — wiring to the API

`TripBuilderClient` (client component) is responsible for:

- Fetching the authenticated `UserProfile` via a simple API call or prop.
- Owning the “stepper” (Review → Form → Results).
- Passing `profile` into both `ProfileReview` and `TripIntentForm`.
- Calling `/api/travel-planner` with the `TravelPlanRequest` payload and managing loading/error state.

---

## 4. Backend AI Orchestration

**Key file**

- `web/app/api/travel-planner/route.ts`

**Main steps**

1. **Auth + Supabase**
   - Uses `getSupabaseServerClient()` (service-side Supabase client) to:
     - Resolve the current user.
     - Load the user’s `UserProfile` row (if any).
2. **Shape: TravelPlanRequestV2**
   - Server-side type that mirrors `TravelPlanRequest` plus a few extras:
     - Normalized airport + city names.
     - `locale`, `personalContext`, etc.
3. **Merging profile + form**
   - `mergeProfileDefaults(form, profile)`:
     - Starts with the form payload.
     - Fills in anything missing from the profile:
       - `originCity`, `originAirport`
       - group size / children / seniors / mobility
       - `transportMode`, `budgetLevel`
       - `tripFocus`, `foodPreference`, `nightlifePreference`, `climatePreference`
       - ticket context (`hasMatchTickets`, `matchDates`, `ticketCities`)
4. **Profile summary**
   - `buildProfileSummary(profile, mergedForm)`:
     - Produces a few bullet lines summarizing the traveler in natural language.
     - Included at the end of the “Trip Focus & Preferences” section in the prompt.
5. **City + match context**
   - Pulls all relevant `cities` from Supabase (fan fest + stadium metadata).
   - Filters `match_schedule` to the selected cities + dates.
   - Groups matches by city for inclusion under “Known Match Schedule”.
6. **Prompt construction**
   - Assembles a long prompt string with:
     - Traveler details (origin, group, mobility, transport, budget, dates).
     - Match context (ticket cities/dates).
     - Trip focus and preferences (food/nightlife/climate).
     - Profile summary.
     - “Cities & Stadiums” block (DB-backed metadata).
     - “Known Match Schedule” block (derived schedule).
     - A **Rules of Execution** section (hard constraints: nights, cityOrder coverage, transport consistency, etc.).
   - Passes prompt to Gemini via `GoogleGenerativeAI` and expects structured JSON back.

This endpoint is the single place where **profile + trip intent + domain data** are fused into an AI call.

---

## 5. How to Recreate This Pattern

If you were rebuilding this in a fresh codebase:

1. **Define the profile schema**
   - Start with a `user_profile` table (or equivalent) mirroring:
     - Home location, group composition, mobility.
     - Budget/food/nightlife/climate preferences.
     - Transport preference.
     - Ticket context (`has_tickets`, `ticket_match`).
   - Add a `UserProfile` TypeScript type that matches the DB schema.

2. **Build a multi-step onboarding form**
   - Client-side React form (`/onboarding`).
   - On submit:
     - Upsert `user_profile` for the current user.
     - Cache ticket matches in `localStorage` for anonymous flows.
   - Ensure the payload exactly matches your `UserProfile` type.

3. **Create a trip-intent form that consumes profile**
   - Define `TravelPlanRequest` (client-side shape) that includes:
     - All trip-specific fields (citiesVisiting, dates, personalContext, tickets).
     - Preference mirrors for anything you want the AI to see.
   - Write `buildPayloadFromProfile(profile)` to:
     - Provide sensible defaults for origin, group, style, tickets.
     - Leave trip-specific fields blank.
   - Merge profile defaults + intent form on submit, then POST to your API.

4. **On the server, re-merge + enrich**
   - Define `TravelPlanRequestV2` as the union of:
     - `TravelPlanRequest` (from client).
     - `UserProfile` fields that might be missing/overridden.
   - Write `mergeProfileDefaults(form, profile)` and `buildProfileSummary(...)` helpers.
   - Pull additional domain data (cities, matches, etc.) from your DB.

5. **Design a constrained AI prompt**
   - Explicitly list:
     - Traveler details (from `mergedForm`).
     - Trip focus & preferences.
     - Match and city metadata.
     - Concrete rules about:
       - Night counts.
       - Required cities.
       - Transport modes.
       - Output JSON schema.
   - Keep the JSON schema stable and versioned; the UI should depend only on that.

6. **Wire the UI to results**
   - Trip Builder client component:
     - Shows ProfileReview.
     - Shows TripIntentForm.
     - Calls `/api/travel-planner` and feeds results into your itinerary renderer (`ItineraryResults.tsx` in this repo).

Once you have these three layers — **profile capture**, **intent form**, **AI orchestration** — you’ve effectively built a repeatable lead magnet: every user that completes onboarding + trip builder generates a high-signal, personalized itinerary you can use for retention, email follow-up, and product-led growth.

