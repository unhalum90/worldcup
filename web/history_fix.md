# Production Incident: Auth/Membership Gating — Fix History

Scope: Trip Builder / Flight Planner / Lodging Planner access gating via Supabase auth cookies + profiles.is_member

Root cause (summary)
- Server-side (middleware/SSR) never saw Supabase sb-* cookies, only client storage keys. As a result, `supabase.auth.getUser()` on the server returned no user, and the middleware redirected to `/login` or paywall in a loop.
- The problem was compounded by mixed host usage (apex vs www) and by prefetches that could trigger redirects before cookies settled.

What stabilizes it now
- Canonical host aligned to apex and code paths updated to explicitly set the sb-* cookies (auth + refresh, including the `.4` variant some SDKs use) with `Domain=.worldcup26fanzone.com`, `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax` on both:
  - `/api/auth/session` (client’s auth change sync)
  - `/auth/callback` (magic-link callback)
- Logging + correlation id (`x-fz-req-id`) added across middleware, SSR, and callback to trace cookies and decisions in Vercel.
- Trip Builder layout marked dynamic to silence build complaints about cookies; prefetch on Trip Builder links disabled to avoid premature redirects.

Environment/config guidance applied
- NEXT_PUBLIC_SITE_URL = `https://worldcup26fanzone.com` (apex)
- Vercel Domains: `www.worldcup26fanzone.com` → 308 → `worldcup26fanzone.com`
- Supabase Auth → Site URL: `https://worldcup26fanzone.com`, Redirect URLs include apex + www wildcards.
- Optional: SUPABASE_COOKIE_DOMAIN = `.worldcup26fanzone.com` (code also derives this from NEXT_PUBLIC_SITE_URL if unset).

Chronological change log (Nov 17, 2025)

1) 97075cd — Fix: consistent membership gating + SSR client typing
- Switch server Supabase client to `@supabase/ssr` and tighten cookie handling.
- Add guards for service role client (`supabaseServer`) and refine types across admin and planner APIs.
- Resolve implicit `any` type errors.
- Disable prefetch on Trip Builder links to prevent login flicker.
- Keep middleware membership gate consistent.
- Files: `web/lib/supabaseServer.ts`, planner/admin API routes, planner UI pages, middleware, package.json/lock.

2) b25c608 — Build: mark Trip Builder route dynamic
- Add `export const dynamic = 'force-dynamic'` and `revalidate = 0` in Trip Builder layout to acknowledge cookie usage at build time.
- File: `web/app/planner/trip-builder/layout.tsx`.

3) 5c49e7c — Debug: comprehensive console logging for auth/membership flow
- Middleware: log request, cookie names, auth result, membership check, and redirect decisions.
- SSR clients (`supabaseServer.ts`, `supabase/server.ts`): log cookie access and service role init.
- Membership check: log user + profile fetch results.
- Trip Builder layout: log gating decisions.
- Auth callback: detailed logs for code exchange + cookie ops.
- Client pages (Login, Paywall, AuthModal, AuthContext): add flow logs.
- Checkout & Activate endpoints: basic diagnostics.

4) fb358d2 — Debug: add correlation id propagation (`x-fz-req-id`)
- Middleware: generate a request id, attach to request/response headers, and include in logs.
- SSR/membership/callback/checkout: read and log the request id for end-to-end tracing.

5) 90324c1 — Fix(types): await `headers()` in async contexts
- Avoid calling `next/headers()` synchronously in SSR helpers; await it only where allowed (e.g., in async RSC/route handlers).
- Files: Trip Builder layout, membership, server SSR helper modules.

6) d7ec2c1 — chore: tiny doc touch to trigger redeploy
- Triggered a safe redeploy to pick up environment changes.
- File: `web/new_gating.md`.

7) 35c93ab — fix(auth): explicitly set sb-* Supabase cookies so SSR/middleware see session
- `/api/auth/session`: after SIGNED_IN/TOKEN_REFRESHED/USER_UPDATED with tokens, explicitly set httpOnly cookies:
  - `sb-<projectRef>-auth-token`, `sb-<projectRef>-refresh-token`
  - and `.4` variants, with Domain=.worldcup26fanzone.com (or SUPABASE_COOKIE_DOMAIN), Path=/, Secure, SameSite=Lax, proper maxAge.
- Also clear these cookies on SIGNED_OUT.
- `/auth/callback`: after `exchangeCodeForSession`, explicitly set the same cookies on the redirect response as a fallback.
- Adds logs to verify cookie writes.

8) b00e19d — fix(build): define redirect response before attaching fallback cookies in callback
- Create the redirect `response` before `response.cookies.set(...)` to resolve a Next.js/TSC error.
- File: `web/app/auth/callback/route.ts`.

Operational notes
- With the explicit cookie writes and single canonical host, the server receives `sb-*` cookies on the immediate next request. Middleware logs should show `hasUser: true` and Trip Builder grants access.
- If any residual loops appear, capture `x-fz-req-id` from the failing request and search Vercel logs for `[MW]`, `[CB]`, `[SSR]`, `[MEM]`, `[TB]` lines with that `rid` to see cookies and decisions.

End state
- Auth persistence is enforced server-side by setting and reading sb-* cookies with stable domain attributes.
- Trip Builder / Flight Planner / Lodging Planner recognize returning, paying users without flicker or loops.

Complete commit list since 2025‑11‑13 (web/)

Note: All times are ISO; order is chronological from oldest to newest in this window.

```text
- 2025-11-17 09:02:18 +0100 — 7b810fc — unhalum90 — docs: add consolidated change history for auth/membership gating incident (Nov 17, 2025)
- 2025-11-17 08:50:13 +0100 — b00e19d — unhalum90 — fix(build): define redirect response before attaching fallback sb-* cookies in auth callback
- 2025-11-17 08:47:38 +0100 — 35c93ab — unhalum90 — fix(auth): explicitly set sb-* Supabase cookies (domain + .4 variants) so SSR/middleware see session\n\n- /api/auth/session: set httpOnly cookies with Domain=apex (or SUPABASE_COOKIE_DOMAIN), path=/\n- also set/remove .4 suffixed variants some SDKs read\n- /auth/callback: fallback cookie write after exchangeCodeForSession\n- adds console logs to verify cookie writes
- 2025-11-17 08:27:09 +0100 — d7ec2c1 — unhalum90 — chore: tiny doc touch to trigger redeploy (pick up env changes)
- 2025-11-17 07:50:33 +0100 — 90324c1 — unhalum90 — Fix(types): await headers() in async contexts; avoid synchronous headers() usage in SSR helpers\n\n- Trip Builder layout: await next/headers()\n- membership + server SSR client: await next/headers() only where allowed\n- SSR helper: avoid calling headers() synchronously; fallback rid capture\n- No behavior change; fixes TS error in layout.tsx
- 2025-11-17 07:47:26 +0100 — fb358d2 — unhalum90 — Debug: add correlation id propagation (x-fz-req-id)\n\n- Middleware: generate req id, attach to request+response headers, log rid\n- SSR clients and membership: read rid from headers and include in logs\n- Trip Builder layout, auth callback, checkout route: include rid in logs\n- No behavior changes beyond logging/headers
- 2025-11-17 07:45:33 +0100 — 5c49e7c — unhalum90 — Debug: add comprehensive console logging for auth/membership flow\n\n- Middleware: log request, cookies, auth result, membership decision\n- SSR clients: log cookie access and service client init\n- Membership checks: log user and profile fetch results\n- Trip Builder layout: log access decisions\n- Auth callback: detailed logging for code exchange and cookies\n- Client pages: login, paywall, auth modal with flow logs\n- Checkout route: server-side logs for user and redirect URL\n- Activation page: log activation API call + response
- 2025-11-17 07:33:36 +0100 — b25c608 — unhalum90 — Build: mark Trip Builder route dynamic (cookies/session) to silence static build warning
- 2025-11-17 07:32:07 +0100 — 97075cd — unhalum90 — Fix: consistent membership gating + SSR client typing
- 2025-11-17 06:13:27 +0100 — 7343b81 — unhalum90 — membership persists across entire site
- 2025-11-17 06:09:02 +0100 — ce8492b — unhalum90 — membership persists across entire site
- 2025-11-17 05:43:49 +0100 — 5b2a15a — unhalum90 — fixing screen reset on trip builder
- 2025-11-16 20:42:59 +0100 — 49751f6 — unhalum90 — Supabase browser client: set unique storageKey ('wc26fanzone-auth') to prevent Multiple GoTrueClient collisions across contexts; should eliminate warnings and token races.
- 2025-11-16 20:35:22 +0100 — c1c609b — unhalum90 — Supabase client: unify browser usage to singleton (reuse supabaseClient.ts) to prevent multiple GoTrueClient instances and refresh token 400s.
- 2025-11-16 20:29:47 +0100 — 7442cc4 — unhalum90 — Add server-side gate for Trip Builder: app/planner/trip-builder/layout.tsx checks session + membership and redirects to login or paywall before render.
- 2025-11-16 20:12:03 +0100 — 6e52a18 — unhalum90 — Revert canonical host redirect in middleware to stop www<->apex loop (ERR_TOO_MANY_REDIRECTS).
- 2025-11-16 20:07:53 +0100 — c9f465f — unhalum90 — Middleware: add canonical host redirect from www.* to apex to unify auth cookies across domains; prevents /login flash when visiting tool pages.
- 2025-11-16 20:06:27 +0100 — f704896 — unhalum90 — Account UI: remove tier/status line from ProfileCard; Add server-side /logout route and wire Header sign-out to use it for reliable sign-out across environments.
- 2025-11-16 20:02:03 +0100 — 7ff8a22 — unhalum90 — Middleware: gate only tool pages (/planner/trip-builder, /flight-planner, /lodging-planner, /onboarding) and check membership directly via SSR client to avoid cookie issues; keep planner hub public.
- 2025-11-16 17:48:56 +0100 — e4968a1 — unhalum90 — Paywall CTA: switch to direct buy endpoint (/api/checkout/member) to avoid store/variant requirements; environment aligns with LEMON_MEMBER_PRODUCT_IDS only
- 2025-11-16 17:12:52 +0100 — c541380 — unhalum90 — Auth flow: force magic link redirect to paywall; adjust EmailOtpVerify fallback to paywall; and prevent auth callback from overriding paywall redirect with onboarding
- 2025-11-16 16:11:40 +0100 — 745f1b8 — unhalum90 — Membership gating flow fixes: add non-localized paywall, enforce onboarding redirect after checkout, align checkout success/cancel URLs, remove localized paywall file, align protected routes, and support LEMON_API_KEY fallback
- 2025-11-16 15:41:57 +0100 — b9b9de4 — unhalum90 — Simplify auth redirect targets
- 2025-11-16 15:28:37 +0100 — 6616a72 — unhalum90 — Fix OTP redirect gating
- 2025-11-16 13:27:29 +0100 — 3666f5a — unhalum90 — Tighten membership gating redirects
- 2025-11-16 13:06:05 +0100 — e7dfb44 — unhalum90 — Implement membership paywall and checkout flow
- 2025-11-15 21:31:05 +0100 — 77e5015 — unhalum90 — Emergency update: Remove gating and simplify navigation
- 2025-11-15 15:15:53 +0100 — e272f41 — unhalum90 — Direct homepage CTA to Lemon checkout
- 2025-11-15 14:21:44 +0100 — ccec1b4 — unhalum90 — Fix Supabase server auth visibility and add checkout logging
- 2025-11-15 13:59:41 +0100 — 60d5575 — unhalum90 — Fix membership page freeze - remove client-side auth check
- 2025-11-15 13:27:23 +0100 — 39e283b — unhalum90 — Complete membership gating rebuild - clean  system
- 2025-11-15 11:35:40 +0100 — 602b31c — unhalum90 — REMOVE MEMBERSHIP GATE FROM PLANNER HUB - Allow direct access to Trip Builder for all users
- 2025-11-15 11:28:04 +0100 — 8cf0d52 — unhalum90 — Remove membership gating from all planners - open access to Trip Builder, Flight Planner, and Lodging Planner
- 2025-11-15 11:02:01 +0100 — f3197df — unhalum90 — Fix: Add conditional client-side membership linking in Planner Hub
- 2025-11-15 10:33:34 +0100 — b08e2ec — unhalum90 — Fix: Remove unreliable middleware-level membership gating
- 2025-11-15 08:26:41 +0100 — 417da59 — unhalum90 — Fix: Check for correct Supabase auth cookie name pattern + use service role for membership checks
- 2025-11-15 08:19:10 +0100 — 55126e3 — unhalum90 — Fix: Use service role client for membership checks in middleware to bypass RLS
- 2025-11-15 08:02:25 +0100 — bfa8a86 — unhalum90 — Build fix: use createServerClient from @supabase/ssr in middleware (package version lacks createMiddlewareClient); retain improved gating behavior
- 2025-11-15 07:58:13 +0100 — 6d07b40 — unhalum90 — Middleware: switch to createMiddlewareClient for reliable auth in edge; if membership check throws, allow and let API enforce; include gate=not_member hint on redirects
- 2025-11-15 07:50:32 +0100 — 6ef7ea0 — unhalum90 — Account/Profile: add visible 'Membership active' chip derived from profiles (is_member/account_level/tier+status)
- 2025-11-15 07:46:56 +0100 — f32dbea — unhalum90 — Activation fallback: if no customers found, scan recent orders by email with included order-items and match by product/variant/name
- 2025-11-15 07:46:26 +0100 — 063af4e — unhalum90 — Activation + gating robustness: support member VARIANT IDs and name-based fallback; record ls_variant_id; isActiveMember checks purchases.ls_variant_id too
- 2025-11-15 07:42:22 +0100 — 87632b6 — unhalum90 — Account page: merge membership flags from profiles with user_profile so account tier displays correctly and reflects admin grants/activation
- 2025-11-15 07:35:27 +0100 — 9e87001 — unhalum90 — Fix activation: avoid unsupported /orders filters/sort; filter matching orders client-side by email/customer and link order-items to orders
- 2025-11-15 07:17:59 +0100 — aa9de52 — unhalum90 — Admin users update: use upsert on profiles (onConflict user_id) so Grant Membership works even if profile row is missing
- 2025-11-15 07:17:38 +0100 — 9ce2baa — unhalum90 — Admin UX tweaks: default /admin -> /admin/users; move blog dashboard to /admin/blog; fix AdminLayout profile query for envs without profiles.id; update sidebar Blog link
- 2025-11-15 07:15:07 +0100 — f8e6bcf — unhalum90 — Make /admin use dashboard layout: remove duplicate /admin/page, redirect /admin/dashboard -> /admin to ensure sidebar renders
- 2025-11-15 06:58:25 +0100 — d7fe6ae — unhalum90 — Fix TS error: replace unsupported Postgrest .group() with client-side aggregation for purchases count in admin users list
- 2025-11-15 06:54:39 +0100 — 07faa3e — unhalum90 — Fix admin users list: replace unsupported getUserByEmail with profile email lookup + admin.getUserById + fallback scan
- 2025-11-15 06:53:38 +0100 — 918ec80 — unhalum90 — Fix Next route conflict: move Analytics under dashboard layout and remove duplicate /admin/analytics page
- 2025-11-15 06:48:20 +0100 — 6783ead — unhalum90 — Admin dashboard overhaul: add Users management with full details and admin actions, secure list/update API routes; add Analytics into dashboard layout; update sidebar to Users/Blog/Analytics
- 2025-11-15 06:34:43 +0100 — 4315d6f — unhalum90 — Add self-serve membership activation flow via Lemon API; wire checkout success_url; fix membership gating fallback\n\n- Add POST /api/membership/activate to verify purchases using Lemon API and update profiles/purchases\n- Add /memberships/activate page for users to trigger activation or provide checkout email\n- Set checkout[success_url] to activation page and cancel_url to memberships\n- Fix membership.ts brace bug and keep purchases fallback\n- Add ‘Already purchased? Activate access’ link on memberships page
- 2025-11-14 21:14:55 +0100 — f158726 — unhalum90 — CRITICAL FIX: Correct isActiveMember query to fix membership gating
- 2025-11-14 21:12:03 +0100 — c8acc8d — unhalum90 — CRITICAL FIX: Correct isActiveMember query - was using malformed .or() preventing membership checks
- 2025-11-14 20:58:28 +0100 — 125f21f — unhalum90 — CRITICAL: Fix webhook bot protection blocking - add skip headers and use custom_data user_id
- 2025-11-14 20:12:08 +0100 — bc184b2 — unhalum90 — Add runtime config to webhook route
- 2025-11-14 20:02:27 +0100 — 7559a28 — unhalum90 — Remove invalid vercel.json runtime config causing build error
- 2025-11-14 16:47:22 +0100 — 0f69148 — unhalum90 — Add vercel.json to register lemon webhook
- 2025-11-14 16:45:47 +0100 — 48920f8 — unhalum90 — Add vercel.json to register lemon webhook
- 2025-11-14 16:42:23 +0100 — 06860a6 — unhalum90 — Add vercel.json to register lemon webhook
- 2025-11-14 16:40:43 +0100 — 5ae8502 — unhalum90 — Add vercel.json to register lemon webhook
- 2025-11-14 16:28:53 +0100 — bead48a — unhalum90 — iddleware patch for memberships
- 2025-11-14 15:20:22 +0100 — 9049fd0 — unhalum90 — chore: update DB notes; remove now-unused lemonsqueezy webhook route
- 2025-11-14 14:36:19 +0100 — 9f4cf40 — unhalum90 — auth: attach purchases to user on sign-in (soft RPC)
- 2025-11-14 14:15:22 +0100 — 5836c6a — unhalum90 — chore: add database_update.md notes
- 2025-11-14 14:04:03 +0100 — 365966a — unhalum90 — fix(blog): use server Supabase client in SSG/SSR and filter to published posts to resolve server component error
- 2025-11-14 13:46:53 +0100 — 592f123 — unhalum90 — Trigger blog page redeploy
- 2025-11-14 13:42:36 +0100 — c8bbd9e — unhalum90 — Trigger blog page redeploy
- 2025-11-14 13:27:35 +0100 — c49178f — unhalum90 — blog: apply additional copy/styling tweaks on dynamic post page
- 2025-11-14 07:27:38 +0100 — cdde2b8 — unhalum90 — blog: minor patch to dynamic post page
- 2025-11-14 07:01:49 +0100 — b7e7db0 — unhalum90 — blog: apply revisions to dynamic post page; remove outdated blog index
- 2025-11-14 06:23:33 +0100 — 6652b40 — unhalum90 — security: restrict seed-transit API to ADMIN_EMAILS allowlist
- 2025-11-14 06:22:21 +0100 — 8ff569a — unhalum90 — admin: add seed-transit tool and API to publish transit article into CMS (blog_posts)
- 2025-11-14 06:15:54 +0100 — aa6c45c — unhalum90 — admin: add New Blank Draft flow and link from generator; enable manual blog writing via CMS
- 2025-11-13 19:39:17 +0100 — b263fec — unhalum90 — auth: add /api/auth/session to sync Supabase cookies from client; blog: add reusable BlogArticle shell for future posts
```
