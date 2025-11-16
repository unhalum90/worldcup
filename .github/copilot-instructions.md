# Copilot Instructions for the World Cup 2026 Fan Zone

This document provides essential guidance for AI agents to effectively contribute to this Next.js-based codebase. Understanding these patterns is crucial for productivity.

## 🚀 Project Overview

This is a Next.js 14+ application serving as a "Fan Zone" for the FIFA World Cup 2026. It helps fans plan their trips, access exclusive content, and connect with other fans.

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Authentication:** Supabase (Email/Password)
- **Payments/Membership:** Lemon Squeezy
- **Internationalization (i18n):** `next-intl`
- **Key Files:**
  - `web/next.config.ts`: Next.js configuration.
  - `web/package.json`: Project dependencies and scripts.
  - `web/middleware.ts`: Handles i18n routing and authentication middleware.
  - `vercel.json`: Vercel deployment configuration.

## 🏗️ Core Architecture & Key Directories

- `web/app/[locale]/`: The heart of the application, using the Next.js App Router. All pages are organized by locale.
- `web/components/`: Shared React components used across the application.
- `web/lib/`: Contains core business logic, database interactions (Supabase), and external API clients (Lemon Squeezy).
  - `web/lib/membership.ts`: Source of truth for checking a user's subscription status.
  - `web/lib/profile/api.ts`: Helpers for fetching and saving user travel profiles.
- `web/messages/{en,es,fr}.json`: Translation files for `next-intl`.
- `web/ai_travel_planner/context/{en,es,fr}/{city}.md`: **CRITICAL:** These markdown files contain detailed, curated travel information for each host city. They are injected into AI prompts to generate travel plans.

## ✨ Key Features & Patterns

### 1. AI Travel Planner & City Context

The AI Travel Planner is a core feature. It generates personalized itineraries by combining user preferences with expert-written city guides.

- **Pattern:** When generating a travel plan, the system reads content from markdown files located in `web/ai_travel_planner/context/en/`. The file name corresponds to the city (e.g., `kansas-city.md`).
- **Your Task:** When asked to modify or enhance travel recommendations, **do not hardcode information**. Instead, update the relevant markdown file in `web/ai_travel_planner/context/en/`. The system automatically uses this content.
- **Example:** To improve recommendations for Dallas, edit `web/ai_travel_planner/context/en/dallas.md`.

### 2. User Onboarding & Profiles

We have a dedicated onboarding flow to collect user travel preferences, which then personalizes their experience.

- **Routes:**
  - `/onboarding`: A multi-step wizard for first-time profile setup.
  - `/account/profile`: Allows users to edit their profile at any time.
- **Membership Handoff:** After a new user pays for a membership, they are redirected to `/onboarding?from=membership&redirect=/planner/trip-builder` to seamlessly create their profile before accessing gated content.
- **Profile Data:** The user's profile (`home_airport`, travel style, etc.) is stored in the `user_profile` table and is automatically used to pre-fill forms like the Trip Builder.

### 3. Feature Flags

We use environment variables as feature flags to enable or disable functionality at build time or runtime.

- `NEXT_PUBLIC_ENABLE_LANGUAGE_MODAL=true`: Shows a language selection modal to first-time visitors.
- `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE=true`: Gently forces authenticated members without a profile to complete the onboarding wizard before proceeding.
- `NEXT_PUBLIC_LS_MEMBER_BUY_URL`: The checkout URL for memberships.

**Your Task:** When implementing a new feature that might need to be toggled, use a `NEXT_PUBLIC_` environment variable. Check for its existence in the relevant component.

## 💻 Developer Workflow

- **Running the dev server:**
  ```bash
  npm run dev
  ```
- **Building for production:**
  ```bash
  npm run build
  ```
- **Environment Variables:** Copy `.env.example` to `.env.local` and fill in the required values (Supabase keys, etc.). These are essential for the application to run.
- **Localization:** To add or change text, edit the JSON files in `web/messages/`. Use the `useTranslations` hook from `next-intl` in components to access the strings.
