# Localization Update Plan

## Current Stack Overview
- **Framework & tooling:** Next.js 15 (App Router) with `next-intl`, locale cookie (`NEXT_LOCALE`) handled by `middleware.ts`, translations stored per locale in `web/messages/*.json`.
- **Active locales:** English (`en`), Spanish (`es`), Portuguese (`pt`), French (`fr`), Arabic (`ar`). German files exist but are not currently surfaced.
- **Language switch UX:** `LanguageSwitcher` writes the locale cookie then reloads the page. Any page with client-side only state (planner, onboarding, forms) must rehydrate cleanly after reload.
- **Existing coverage:** Header navigation, some landing components (e.g., `FeatureShowcase`) already use `useTranslations`. Large areas (hero, modals, planners, account tools) are still hard-coded in English.
- **Content sources:** Markdown guides in `web/app/**` folders, SQL-driven data, and AI-generated outputs are English-only today.

## Global Workstreams
1. **Translation inventory & namespace strategy**
   - Audit `web/messages/en.json` to remove unused keys (e.g., legacy `hero.*`) and create namespaces for planner, onboarding, auth, account, admin.
   - Establish key naming conventions (`section.component.field`) and document them.
2. **Shared UI & infrastructure**
   - Wrap `AuthModal`, `EmailCaptureModal`, toasts, button labels, loading states, and empty states with `useTranslations`.
   - Ensure server responses used in UI (e.g., `/api/travel-planner` errors) return translation-ready codes that map to localized messages client-side.
   - Confirm RTL support (Arabic) by checking flex direction, text alignment, and icon mirroring in shared components.
3. **Translation workflow**
   - Export master `en.json` for translators, ingest localized copies via the existing `update-translations.sh`.
   - Add CI guardrails (lint script) to verify every locale file contains the same key set as English.
4. **Testing**
   - Smoke test each locale with authenticated and anonymous sessions (planner relies on Supabase cookies).
   - Add playwright/cypress scenarios to validate that localized pages render without hydration warnings.

## Page-by-Page / Feature Plan

### Shell & Global Components
- `web/app/layout.tsx`, `Header.tsx`, `Footer.tsx`, `LanguageSwitcher.tsx`, `SubscribeModal`, `ExitIntentModal`, `GlobalAuthLauncher`, `CookieConsent`, `WebVitals`.
- Action items:
  - Replace hard-coded text (button labels, placeholders, consent copy) with translations.
  - Ensure aria labels, alt text, and tooltips are localized.
  - Validate locale is passed to metadata (Open Graph, canonical links) where appropriate.

### Homepage (`web/app/page.tsx`)
- Components: `HeroSplit`, `CountdownTimer`, `FeatureShowcase`, `DemoSection`, `WorldCupTimeline`, `QualifiedTeamsSection`, `SectionDivider`.
- Current gaps: Hero headline/paragraphs/CTAs, trust indicators, button helper text, video captions, timeline copy.
- Plan:
  - Introduce `landing.hero.*` namespace for the hero and trust rows.
  - Move countdown labels and error strings into `landing.countdown`.
  - Ensure video fallback text and CTA buttons use translations.

### Guides Landing & City Pages (`/guides`, `/guides/[slug]`, `/groups_best/[slug]`, `/teams`, `/groups`)
- Files: `web/app/guides/page.tsx`, markdown city files, group pages, team pages.
- Current gaps: Most markdown content is English; CTA banners and headers are literal strings.
- Plan:
  - Externalize headings, filter labels, badges, CTA copy, and empty states.
  - Decide whether markdown files need localized versions (`/guides_best/fr/...`) or an alternate data source.

### Planner Hub (`web/app/planner/page.tsx`)
- Contains hero, phase cards, modals, CTA copy.
- Plan:
  - Create `planner.hub.*` namespace for hero headline, microcopy, cards, trust text, CTA buttons, and loading states.
  - Localize AuthModal invocation strings and locked-state message.

### Trip Builder Flow (`/planner/trip-builder`)
- Files: `web/app/planner/trip-builder/page.tsx`, `TripIntentForm`, `ProfileReview`, `PlannerLoader`, `ItineraryResults`, downstream components (`ItineraryDay`, `TripSummary`, download/export prompts).
- Current state: Entire experience is hard-coded English, including validation messages and alerts.
- Plan:
  - Define namespaces (`planner.tripBuilder.page`, `planner.tripBuilder.form`, `planner.tripBuilder.loader`, `planner.tripBuilder.results`).
  - Replace UI strings, button titles, tooltips, inline helper text, and validation errors with translations.
  - Map API error codes to localized messages; surface toast/snackbar translations.
  - Ensure generated itinerary summaries support localized labels (e.g., “Day 1”, “Estimated cost”).

### Flight & Lodging Planners (`/flight-planner`, `/lodging-planner`)
- Files: `web/app/flight-planner/page.tsx`, `web/app/lodging-planner/page.tsx`, supporting components (`PlannerLoader`, `LodgingZoneMap`, etc.).
- Plan:
  - Extract hero copy, step descriptions, loading banners, error notices, CTA text, and form labels.
  - Localize tooltip text, modal content, and share/export prompts.

### Onboarding (`/onboarding`)
- File: `web/app/onboarding/page.tsx` already uses `useTranslations('onboarding')` but many helper paragraphs remain literal English.
- Plan:
  - Audit the steps for inline strings (e.g., “Let’s lock in your home base…”) and move to `onboarding.steps`.
  - Localize validation errors, placeholder text, and toast messages in `AirportAutocomplete`, `MatchPicker`, and `TripIntentForm` integration.

### Account & Profile (`/account`, `/account/profile`)
- Files: `web/app/account/page.tsx`, `ProfileCard.tsx`, `/account/profile/page.tsx`, forms and helper components.
- Plan:
  - Externalize section headers, button labels (“Update profile”), tooltips, and empty states.
  - Localize feedback messages from profile save success/failure.

### Auth Flow & Modals
- Components: `AuthModal`, `EmailCaptureModal`, `MagicLinkAuthModal`, `/verify-email`, `/auth/auth-code-error`, `/login`.
- Plan:
  - Translate hero text, success/error states, placeholders, CTA buttons, warnings.
  - Ensure API responses and localStorage prompts use localized strings.

### Admin Surfaces (`/admin/**`)
- Files: `web/app/admin/(dashboard)/**`, `Admin analytics`, `reset-password`, `generate` route UIs.
- Plan:
  - Translation coverage for headings, table columns, status badges, actions, and form validation.
  - Provide fallback English if localization backlog exists, but ensure key structure is ready.

### API Responses & Emails
- API routes returning text (e.g., `/api/travel-planner`, `/api/lodging-planner/generate`) should return codes/structured data and let the client translate them.
- Supabase auth emails (magic link, onboarding) currently English; consider hooking into custom email templates per locale.

### Static Assets & Metadata
- Update `openGraph`, `twitter`, and `sitemap` metadata per locale where supported.
- Translate alt text for images/flags if displayed with descriptive copy.

## Execution Roadmap
1.  Global groundwork – clean translation files, define namespaces, localize shared components and homepage.
2.  Planner suite (hub + trip/flight/lodging) including API error mapping and validation.
3. Onboarding and account surfaces, auth modals, verify page.
4.  Guides/teams/groups pages, markdown strategy, admin & remaining modals.
5. **QA & Release:** Locale-by-locale regression, user acceptance for RTL, finalize translator handoff and update automation scripts.

Document owners should update this plan as work completes or new pages surface. Once all sections are localized, create an ongoing checklist for every new component to include translation keys before merge.
