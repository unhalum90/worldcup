# WorldCup26FanZone.com — Feature Spec (Granular) + Sprint Plan + Landing Page Directions

> Scope: **Website/App features only** (forums, city guides, AI trip planner, multilingual, paywall, admin). This excludes the newsletter and daily video pipeline.

---

## 1) Personas & Jobs-To-Be-Done

- **Traveling Fan (Free → Paid)**: Finds city-specific tips, asks questions, plans trip, joins meetups, saves favorites.
- **Fan Organizer / Power User (Paid)**: Creates meetups, shares hacks, posts matchday checklists for their fanbase.
- **Moderator (Trusted)**: Pins resources, merges duplicates, removes spam, handles reports.
- **Admin/Editor**: Curates city guides, edits sections, configures paywall, manages Stripe customers.

---

## 2) Core Modules (Granular Requirements)

### A. City Forums (Reddit-style, per host city)
  - Markdown support (links, lists), image URLs (no file uploads MVP).
  - Upvote/downvote + “Most Helpful” sort.
  - **Sticky threads**: “Start Here”, “Transit 101”, “Where fans of 🇫🇷/🇯🇵 meet”.
  - **Matchday Live Thread**: auto-created on matchdays (pin at top; collapsible updates).
  - Fields: title, city, date/time (TZ-aware), venue, map link, host handle, capacity (optional).
  - RSVP (✅/❌/🤔) counters; export `.ics`.
  - Auto-archive past events; keep recap link.
  - Report → queue → actions: hide, lock, delete, ban, pin.
  - Basic automod rules: block gambling spam terms; throttle links for new accounts.
 **Access / Paywall**:
  - NOTE: Forums will require users to be registered to access them at all (no anonymous browsing).
  - **Free period (pre-paywall)**: Registered users have full read + post + RSVP rights until the paywall date.
  - **Post-paywall (after paywall date, e.g. Apr 1)**: Reading may remain public or registered-only (configurable), but **posting and RSVPing will require a paid subscription**. This keeps RLS and UX simple while preserving discoverability.
  - Grandfathering switch (admin): early signups get a discount code or extended access.
  - **After Apr 1**: Read = free (optional), Post/RSVP = **paid**; or **all gated** (config flag).
  - Grandfathering switch (admin): early signups get a discount code or extended access.
-- **Demo-first:** Build **Boston** as the fully polished exemplar (owner preference); public preview shows placeholder/summary content and the full guide will be added later.
- **Guide schema**:
 **Quotas**: Paid users: **no quota** (unlimited plans). Free users: conservative default (e.g., 1 plan/day) to limit cost and abuse; configurable.
  - *Fan Bars by Country* (e.g., 🇳🇱 Dutch bar, 🇲🇦 Moroccan spot),
  - *Itinerary: 24/48/72h* (family, budget, nightlife variants),
  - *Do / Don’t*, *Safety & Tips*, *Links & Maps*.
- **Provenance**:
  - Interviews (e.g., Sounders STH for Seattle); source notes kept internal.
  - Update cadence (admin field): reviewed_at timestamp and next_review_at.

### C. AI Trip Planner (premium)
- **Inputs**: city/cities, dates, group size, budget, interests, mobility needs, tickets, transport preferences.
- **Output**:
  - Structured day plan (morning/afternoon/evening), restaurant recs, transit specifics, map links,
  - *Why suggested* mini-justifications; alternatives if sold out.
- **Actions**: Save itinerary, duplicate & tweak, export `.ics` + shareable link.
- **Quotas**: X plans/day/user on paid; Y on free during promo (configurable).
- **Engine**: Make.com + OpenAI; cache by prompt hash to control costs.

### D. Media Guides (embedded video per city/stadium)
- **Format**: HeyGen avatar of Eric + b‑roll; concise (60–120s).
- **Localization**: captions EN/ES/FR/PT/AR; optional dubbed track.
- **Placement**: surfaced atop each city guide and in “Start Here” sticky.
- **A/B**: test video-first vs text-first layouts.

### E. Internationalization
- **Languages**: EN, ES, FR, PT, AR (toggle in header; remember preference).
- **Coverage**: UI strings + guide summaries + video captions; forum stays user-language (no auto-translate MVP).
- **Fallback**: English if translation missing; flag missing keys to admin.

### F. Auth, Subscription, Roles
- **Auth**: Supabase magic link (email) + optional OAuth later.
- **Payments**: Stripe Checkout → webhook → `subscriptions` table update.
- **Roles**: `user`, `paid`, `moderator`, `admin`.
- **Gates**: RLS enforces read/write by role + subscription status.

### Moderation & Admin Notes
- **Moderation basics**: allow users to flag posts; flagged items are queued for review. The owner will be the initial super-admin able to take actions (hide, lock, delete, ban, pin) via a simple admin UI. Volunteer moderators can be added later.

### CMS Preference
- Owner preference: a home-built CMS form that lets admins enter templated guide content which can be reused across the 16 host cities. The CMS should support preview vs full content toggles and simple WYSIWYG/Markdown editing for sections.

### G. Admin / CMS
- **Content**: Admin panel to edit guide sections, publish previews, set paywall percentages.
- **Moderation**: Reports queue, ban list, pinned threads manager.
- **Pricing**: Toggle free-to-paid date, set price, generate promo codes.
- **Analytics panel**: Daily active users, new threads, RSVPs, conversion to paid.

---

## 3) Data Model (Supabase tables)

- `users` (auth) → id, email, created_at
- `profiles` → user_id (PK, FK), handle, country, avatar_url, role
- `subscriptions` → user_id, status, plan, current_period_end, source
- `cities` → id, name, country, slug, tz, is_demo, order
- `venues` → id, city_id, name, address, map_url
- `guides` → id, city_id, title, preview_html, full_html, reviewed_at, next_review_at, paywall_ratio
- `threads` → id, city_id, topic, title, body_md, author_id, pinned, locked, score, created_at
- `posts` → id, thread_id, author_id, body_md, score, created_at
- `meetups` → id, city_id, title, starts_at, venue_name, venue_map, host_id, capacity, created_at
- `rsvps` → id, meetup_id, user_id, status (yes/no/maybe), created_at
- `reports` → id, target_type, target_id, reason, reporter_id, status
- `itineraries` → id, user_id, city_id, title, days_json, shared_slug, created_at
- `favorites` → id, user_id, target_type, target_id, created_at
- `locales` / `translations` → key, lang, value
- `settings` → paywall_date, pricing, features_json

**RLS (examples)**  
- `threads`: `policy read all; insert/update where auth.uid() = author_id;`  
- `guides.full_html`: readable only if `subscriptions.status='active'` or city is demo.  
- `meetups`: create if `role IN ('paid','moderator','admin')` after Apr 1.

---

## 4) Sprint Plan (12 weeks / 6 sprints)

**Sprint 0 (1 week): Foundation**
- Repo + Vercel + Supabase init; Tailwind/shadcn setup; i18n scaffolding; auth skeleton.

**Sprint 1 (2 weeks): Cities & Guides (Boston demo)**
- `cities`, `guides` tables + CMS forms.
- Render guide sections (preview vs full paywall).
- Publish **Boston** exemplar; language toggle groundwork.

**Sprint 2 (2 weeks): Forums MVP**
- `threads`, `posts`, voting, sticky/pin, report flow.
- City topics; basic moderation actions.
- Matchday Live Thread auto-creator (CRON/Edge function).

**Sprint 3 (2 weeks): Meetups + RSVP + Calendar**
- `meetups`, `rsvps`, ICS export; list & detail views.
- City calendar list; auto-archive past meetups.

**Sprint 4 (2 weeks): AI Trip Planner MVP + Stripe**
- Planner form → Make/OpenAI → itinerary save/export.
- Stripe Checkout + webhook → subscription gates; role badges.

**Sprint 5 (3 weeks): Intl + Media + Polish**
- EN/ES/FR/PT/AR UI strings; captions pipeline.
- Video embed module; SEO/OG, sitemap, schema.org.
- Analytics (Plausible/GA4), perf + accessibility pass, launch checklist.

---

## 5) Landing Page — Wireframe & Copy Directions

**Hero**  
- Headline: “Plan. Connect. Celebrate. — The Fan Hub for World Cup 2026”  
- Sub: “City forums, insider guides, and an AI trip planner — all in one place.”  
- CTA: **Join Early Access** (email capture)  
- Secondary CTA: **See the Monterrey Demo**

**Why It’s Different (3 cards)**  
- **City Forums**: crowd-sourced hacks by host city.  
- **Insider Guides**: verified tips from locals & season ticket holders.  
- **AI Planner**: tailor-made daily plans around your matches.

**Demo Section**
- Boston: screenshots + 60–90s video explainer (placeholder if video not ready).  
- “This is the level of detail every city will get.”

**How It Works (3 steps)**  
1) Pick your city & dates → 2) Join the forum & meetups → 3) Get your AI plan.  

**Pricing Timeline**  
- “Free until **Apr 1, 2025**” → “Presale in March: **$39.99** (then **$49.99**).”  
- Benefits list (forums, meetups, AI planner, multilingual).

**FAQ**  
- Moderation & safety, refunds, languages, payment timing, privacy.

**Footer**  
- Language switcher, social links, contact, legal.

---

## 6) Risks, Mitigations, Open Questions

- **Forum seeding**: Use starter threads + moderator prompts; pin “Best of” posts weekly.
- **Moderation load**: Start small with trusted volunteers; add rate limits & automod filters.
- **Paywall backlash**: Clear countdown & value messaging; grandfather early supporters with coupon.
- **AI costs**: Cache itineraries; set quotas; batch requests via Make; log token usage.
- **Localization scope**: Start EN/ES; add FR/PT/AR as top pages stabilize.

**Open**  
- Read-only vs fully gated forums after Apr 1?  
- Country-team tagging inside city forums? (e.g., 🇲🇦 in Miami)  
- Which payment model final? (lifetime pass vs tournament pass with cut-off date)

---

## 7) Acceptance Criteria (MVP)

- Users can **sign up** and **post** in a city forum; moderators can **pin/lock**.
- **Boston** guide renders with preview vs full-paywall sections (placeholder content for full guide).
- Users can **create/RSVP** to meetups; export ICS.
- Paid users can **generate/save/export** an AI itinerary.
- Language toggle **persists**; at least EN/ES ship at MVP.
- Stripe payment → **subscription active** → gates open within 30s.

---

**Owner:** Eric Chamberlin  
**Date:** 2025-10-06  
**Repo/Hosting (assumed):** Next.js + Supabase on Vercel  
