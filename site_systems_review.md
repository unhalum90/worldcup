# WC26 Fan Zone – Site Systems Review

## Snapshot
- **What is this site?** A Next.js-powered hub for 2026 FIFA World Cup fans that blends editorial travel content, AI planning tools, and a gated community.
- **What does it do?** Guides fans through planning, booking, and experiencing multi-city World Cup trips with AI-generated itineraries, flight and lodging optimizers, detailed city guides, and group/team intelligence.
- **What is the user experience?** Public marketing pages gather interest, while a Supabase-backed membership unlocks the Trip Planner suite, forums, saved itineraries, and personalized theming.

## What this site is
WC26 Fan Zone positions itself as the all-in-one travel and community companion for the 2026 FIFA World Cup. The platform combines travel research, logistics tooling, and fan engagement experiences across 16 host cities in the United States, Canada, and Mexico. It is built on the Next.js App Router with server/client Supabase helpers, next-intl localization, and Vercel-supplied analytics tooling.

## What the site does
- Surfaces editorial travel intelligence (city guides, group analysis, team snapshots) translated into five languages.
- Captures fan context through an onboarding flow that stores structured profiles in Supabase.
- Uses Gemini-based AI endpoints to generate itineraries, flight strategies, and lodging zone maps tailored to profile data and trip intent.
- Persists saved plans, match selections, and preferences so fans can iterate from planning to booking.
- Encourages engagement via gated forums, newsletters, and modal-driven lead capture.

## User experience flow
1. **Landing & discovery.** Fans arrive on a marketing-forward homepage featuring countdowns, feature cards, demo access, and qualified team timelines.
2. **Exploration layer.** Public routes cover `/guides`, `/teams`, `/groups`, and `/groups_best/[city]`, offering depth content plus CTAs into the planner and download funnels.
3. **Account creation & onboarding.** Visiting `/planner` or `/forums` prompts a magic-link AuthModal. After Supabase authentication, `/onboarding` gathers traveler profile data (home airport, group size, budgets, climate, tickets, etc.) and stores it via the `/api/profile` endpoint.
4. **Planning suite.** Authenticated users unlock the four-phase planner from `/planner`, progressing from Trip Builder to Flight and Lodging planners. State is passed via localStorage bridges and Supabase APIs, and premium routes use themed UIs with onboarding context baked in.
5. **Account management.** `/account` exposes profile edits plus saved itineraries (rename, reopen, delete). Language preferences and favorite team selection feed dynamic navigation theming.
6. **Retention loops.** Exit intent, subscribe, and language modals plus Beehiiv embeds promote ongoing engagement. Analytics (Vercel, custom WebVitals) monitor performance.

## Tools & user benefits

### Trip Builder (`/planner/trip-builder`)
- **Purpose.** AI-generated itinerary creator that merges onboarding data with fresh trip input.
- **Key mechanics.** Collects trip-specific dates, host city selections, match tickets, and personal context; posts to `/api/travel-planner` which uses Gemini + city context files to build multiple itinerary options.
- **Output.** Option cards featuring routing, match highlights, insider tips, logistics, and interactive timelines rendered by `ItineraryResults`.
- **Benefits to fans.** Delivers tailored plans that respect tickets, accessibility, and group composition; allows saving to Supabase for later editing; bridges into Flight and Lodging planners via local storage.

### Flight Planner (`/flight-planner`)
- **Purpose.** Converts a saved Trip Builder selection into flight strategies.
- **Key mechanics.** Reads the selected itinerary (`fz_selected_trip_option`), combines it with profile data, and calls `/api/flight-planner/generate`. Gemini produces JSON for “Smartest,” “Budget,” and “Fastest” options with airlines, durations, pricing bands, and booking tips.
- **UI features.** Accordion pills summarizing suitability, detailed legs, benefit callouts, alternate airports, and export placeholders.
- **Benefits to fans.** Translates complex multi-city hops into digestible choices, highlights flexibility considerations, and keeps family or accessibility notes consistent with stored preferences.

### Lodging Planner (`/lodging-planner`)
- **Purpose.** Recommends neighborhoods and lodging strategies around the user’s itinerary.
- **Key mechanics.** Pulls itinerary context from Trip Builder, merges slider/weight preferences, and hits `/api/lodging-planner/generate` for Gemini-authored zone insights. Includes map markers (`LodgingZoneMap`) and toggleable zone visibility.
- **Benefits to fans.** Personalizes recommendations by nightly budget, stadium proximity, nightlife appetite, and family needs; surfaces commute times and booking guidance in one view.

### City Guides (`/guides`, `/guides/[slug]`)
- **Content.** For each host city: hero context, stadium logistics, transit, lodging recommendations, climate notes, highlights, and download CTAs (Dallas guide live, others queued with release dates).
- **Benefits.** Offers structured pre-trip research, ties into paid/free guide funnels, and nudges newsletter signups. Filterable by country to help plan multi-country loops.

### Group Stage Intelligence (`/groups`, `/groups_best/[city]`)
- **Data layer.** `groups` dataset calculates distance, complexity, transit, and climate factors per FIFA group. Markdown-driven “Best/Worst of” city analyses render via ReactMarkdown.
- **Benefits.** Educates fans on travel burdens before ticket commitments, highlighting easier vs. harder groups and city-by-city watch-outs.

### Team Hub (`/teams`, `/teams/[slug]`)
- **Features.** Qualified team cards with confederation badges, rankings, and links to team detail pages (not shown here but implied by routing). `QualifiedTeamsSection` mirrors this on the homepage.
- **Benefits.** Lets fans follow specific nations, anticipate travel corridors, and cross-link into planners with their team context driving itinerary suggestions.

### Host City Forums (`/forums`)
- **Status.** Auth-gated Supabase table (`cities`) populates per-city discussion entry points; UI ready pending topic/post features.
- **Benefits.** Provides community layer for sharing intel, seeded by host city taxonomy and reinforcing membership value.

### Membership & Account Layer
- **Authentication.** Passwordless magic links via Supabase, with `/verify-email` confirmation and persistent sessions handled in `AuthContext`.
- **Profile storage.** `user_profile` table captures nuanced traveler traits with RLS; onboarding writes, account page reads/edits.
- **Saved trips.** `travel_plan_saved` table stores itineraries, allowing rename, reopen, delete from `SavedTripsCard`.
- **Benefits.** Maintains continuity across planning sessions, personalizes navigation (team colors via `useTeamNavbarTheme`), and ensures privacy by design.

### Localization & Personalization
- **Internationalization.** `next-intl` provides localized copy in English, Spanish, French, Portuguese, German, and Arabic; `LanguageSwitcher` plus optional `LanguageModal` encourage switching.
- **Theming.** Planner routes adjust gradients via `usePlannerTheme`, while navigation adopts favorite team colors for emotional resonance.
- **Benefits.** Meets global fan expectations, reduces friction for non-English speakers, and deepens brand connection via team identity cues.

### Engagement & Monetization Systems
- **Newsletter.** Beehiiv-powered SubscribeModal, exit intent prompts, and CTA buttons drive list growth. `.env` config toggles language modal behavior.
- **Commerce hooks.** City guides link to Lemon Squeezy checkout; planner cards hint at future PDF exports and share links.
- **Analytics.** Vercel Analytics, Speed Insights, and custom `WebVitals` component collect performance telemetry for iteration.

## Technical systems overview
- **Frontend stack.** Next.js App Router, React Server Components, Tailwind-esque utility classes, and modular component library for planner UI.
- **Backend & data.** Supabase handles auth, RLS-protected tables (`user_profile`, `travel_plan_saved`, `cities`, etc.), and edge functions via `createServerClient`.
- **AI orchestration.** Google Gemini 2.5 Flash drives itinerary, flight, and lodging generation with deterministic JSON prompts and fallback fixtures if parsing fails.
- **State management.** Context providers (`AuthContext`), localStorage bridges, and API routes provide continuity across planner steps.
- **Deployment stance.** Designed for Vercel (metadata, OG tags, analytics), with environment variables gating Supabase keys and Gemini access.

## Fan value highlights
- Connects research, planning, and booking prep into one funnel, reducing context switching between disparate travel apps.
- Honors real-world constraints (tickets, kids, mobility, budgets) by blending profile defaults with per-trip inputs.
- Keeps the experience bilingual/multilingual and team-aware, matching the global nature of the World Cup audience.
- Builds long-term engagement loops (saved plans, forums, newsletter) that can evolve into premium offerings.

