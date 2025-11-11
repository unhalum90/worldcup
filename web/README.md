This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment notes (membership)

- Public checkout envs read at build time in the client. Ensure these are set in Vercel before deploying:
  - `NEXT_PUBLIC_LS_MEMBER_BUY_URL`
  - `NEXT_PUBLIC_LS_BUNDLE4_BUY_URL`
  - `LEMON_PORTAL_URL` (fallback)
- Server fallbacks are available at `/api/checkout/member` and `/api/checkout/bundle4` if envs are missing.

## Trip Builder Demo

- Public demo route: `/trip_builder_demo`
- Data source: `data/trip_builder_demo.json`
- Purpose: Share a stable, printable view of a generated itinerary (no auth required, no PDF page-break issues).
- To update the demo, edit the JSON file and redeploy. The page also shows the raw JSON at the bottom for quick copy/share.

## Language selection modal

- By default, the first-visit language selection modal is disabled to avoid prompting while localization is partial.
- To enable it, set an environment variable before build/runtime:
	- `NEXT_PUBLIC_ENABLE_LANGUAGE_MODAL=true`
- When enabled, the modal will appear on first visit if the `wc26-language-selected` cookie is not present, and will set both `wc26-language-selected` and `NEXT_LOCALE` cookies upon selection.

## Onboarding and Travel Profile

- Routes:
	- `/onboarding` — 3-step wizard to collect profile once (requires auth). Supports membership handoff.
	- `/account/profile` — edit your profile anytime.
	- `/api/profile` — GET/PUT the profile for the current user (SSR auth). Validates `home_airport` IATA codes against our dataset.
	- `/api/onboarding/complete` — POST to set a 30-day `wc26-onboarded` cookie (used for gentle gating and UX flows).

- Membership-aware handoff:
	- After checkout, redirect new members to `/onboarding?from=membership&redirect=/planner/trip-builder`.
	- The wizard will save the profile, set the cookie, and the final CTA will continue to the `redirect` path.
	- The `redirect` param only accepts same-origin relative paths and ignores `/api/*` for safety.

- Optional gating (off by default):
	- Set `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE=true` to gently require onboarding for active members without a profile.
	- Behavior (middleware): if user is authenticated, is an active member, lacks a `user_profile` row, and isn’t already on `/onboarding`, they’re redirected to `/onboarding?from=membership&redirect=<original>`.
	- Active membership is detected via `web/lib/membership.ts`. If the `subscriptions` table doesn’t exist yet, the check safely returns false (no gating).
- Analytics:
	- When Google Analytics is enabled, completing onboarding fires an `onboarding_completed` event with non-PII metadata (budget level, preferred transport, climate preference, kids/tickets presence).

- Planner defaults:
	- Trip Builder now auto-prefills the wizard and merges the saved profile server-side so `/api/travel-planner` always sees origin, family makeup, tickets, and style preferences (form inputs still override).
	- Verified profile owners see a “Review your travel profile” summary on `/planner/trip-builder`; once confirmed, they only enter trip-specific details (dates, cities, optional extra context). “Make changes” opens `/account/profile` to edit the source of truth.
	- `web/lib/profile/api.ts` exposes `useProfile`, `fetchProfile`, and `saveProfile` helpers for other planners.
	- Flight & lodging planners will plug into the same helpers next sprint; when the feature flag is off they continue to fall back gracefully.
