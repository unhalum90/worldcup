🧭 USER SETTINGS AREA — IMPLEMENTATION PLAN (CONCRETE)

1) Core Objectives (scope for initial release)

- Logged-in users can view their profile (email, name, avatar) and membership tier.
- Users can see purchase history (PDFs, bundles, memberships) pulled from Supabase.
- Users can open a subscription management portal link (Lemon Squeezy).
- Optional: newsletter toggle shown if mailing_list row exists; updates allowed.

Assumptions
- We will align with existing profiles table (already created for forums) and extend it with a few fields; we won’t replace it.
- Lemon Squeezy is the source of truth for purchases/subscriptions; Supabase stores a normalized copy and raw payloads.

—

2) Tech Stack & Integrations

- Auth/profile: Supabase Auth + existing profiles table (RLS enabled).
- Purchases/subscriptions: Lemon Squeezy webhooks → Supabase (service role client for writes).
- Portal: Lemon Squeezy customer portal link (API or env-configured URL per customer).
- Web: Next.js App Router (server components) + Tailwind. We’ll protect /account via SSR on the page, not middleware.
- i18n: next-intl already in place; add a few strings for labels.

Required env
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (already used)
- SUPABASE_SERVICE_ROLE_KEY (for webhook route only; never exposed client-side)
- LEMON_API_KEY (server only)
- LEMON_WEBHOOK_SECRET (server only; for signature verification)
- LEMON_MEMBER_PRODUCT_IDS (comma-separated list of Lemon product IDs that grant membership)
- OPTIONAL: LEMON_PORTAL_URL (fallback static portal URL)

—

3) Database Changes (Supabase)

We will extend profiles and add purchases. Existing profiles columns (from migrations) include: user_id (PK), handle, role, country, avatar_url, created_at, plus subscription columns added in 005.

Add/ensure these on profiles
- email text (nullable) — denormalized for easier joins to webhook payloads
- name text (nullable)
- account_level text default 'free' check in ('free','city_bundle','member')
- updated_at timestamptz default now()

Create purchases table
- id uuid PK default gen_random_uuid()
- user_id uuid nullable references profiles(user_id) on delete set null
- email text nullable (for cases where user hasn’t signed up yet; used for reconciliation)
- product_id text (Lemon product identifier)
- product_name text
- price numeric(10,2) default 0
- currency text default 'USD'
- status text check in ('pending','completed','refunded','failed','void') default 'completed'
- ls_order_id text unique
- payload jsonb default '{}'::jsonb (raw webhook for auditing)
- purchase_date timestamptz default now()
- created_at timestamptz default now()
- updated_at timestamptz default now()

Indexes & RLS
- index on user_id; unique index on ls_order_id.
- RLS enabled; policies allow users to select their own rows (auth.uid() = user_id). Inserts are via service role (bypass RLS).

A single migration will perform all of the above (see db/migrations/007_user_settings.sql).

—

4) Data Flow (Lemon → Supabase)

Webhook route: /api/webhooks/lemon (server-only)
- Verify signature with LEMON_WEBHOOK_SECRET (HMAC, per Lemon docs). If verification fails, 400.
- Parse event types: order_created, subscription_created, subscription_updated, refund_created.
- Insert or upsert purchases by ls_order_id; attach raw payload.
- Try to map to a user: find profiles by profiles.email matching payload customer email; if found, set user_id. If not found, keep user_id null and keep email.
- If product_id matches membership (in LEMON_MEMBER_PRODUCT_IDS), update profiles.subscription_tier/subscription_status/account_level accordingly.

Optional trigger
- On insert into purchases: set purchase_date = now(), updated_at = now().
- Optional: forward an email via Resend/Make.com.

—

5) Front-End Structure (/account)

Protection
- Do NOT add auth logic to middleware (we already use it for i18n). Instead, the /account page will be a server component using @supabase/ssr to fetch the current user; if missing, redirect('/login').

Page & components
- app/account/page.tsx (server):
  - get user via lib/supabase/server
  - fetch profile (select from profiles by user_id)
  - fetch purchases for user_id; if none, fall back to email match
  - render a simple tabs UI with Tailwind

- components/account/ProfileCard.tsx (client): read-only display (name, email, avatar, tier). Editing can be added later via an API route.
- components/account/PurchasesTable.tsx (client): table of purchases (date, item, price, status).
- components/account/SubscriptionCard.tsx (client): button to request portal link from /api/account/portal.
- components/account/NotificationsCard.tsx (client): optional newsletter toggle if mailing_list has a row for the email.

i18n
- Keys: account.profile, account.purchases, account.subscription, account.notifications, account.manageSubscription.

—

6) API Routes

/api/webhooks/lemon (POST)
- Uses supabase service role (lib/supabaseServer.ts) to insert into purchases and update profiles.
- Validates signature (TODO included in code scaffold with proper header and secret usage).

/api/account/portal (POST)
- Requires logged-in user; accepts optional customer_id.
- If LEMON_API_KEY and customer_id are present, requests a portal link from Lemon API; else if LEMON_PORTAL_URL present, returns that; else 400.

Optional later
- /api/account/profile (PATCH) to update name/avatar_url with RLS-protected anon client.

—

7) Design Layout (example)

[ Avatar + Name + Email ]
Account Level: Member (Active)

Tabs: Profile | Purchases | Subscription | Notifications

Purchases table
- Date | Item | Price | Status

—

8) Deployment & Testing

Database
- Apply migration 007_user_settings.sql in Supabase (SQL editor or CLI). Verify columns and RLS policies.

Webhooks
- Set LEMON_WEBHOOK_SECRET in the project environment.
- Configure Lemon Squeezy to send webhooks to /api/webhooks/lemon.
- Test with a sample payload (from Lemon docs) and verify a row appears in purchases; verify profile updates when product_id matches membership list.

App
- Add /account page and components; ensure redirect to /login on missing session.
- Test /api/account/portal with and without customer_id and with LEMON_PORTAL_URL fallback.

Rollout
- Link “My Account” in navbar (only when logged in).
- Staging deploy → run through end-to-end test (login → /account → portal link → webhook ingest).
- Production deploy.

—

9) Future Enhancements
- Profile photo uploads (Supabase Storage + RLS signed URLs).
- Saved itineraries tied to planner output.
- In-app notifications (Supabase Realtime) and granular email prefs.
- Stripe/Paddle adapters if multi-processor support is needed later.