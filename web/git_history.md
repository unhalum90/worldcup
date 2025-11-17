ericchamberlin@mac web % git log --oneline --all
15f886a (HEAD -> main, origin/main, origin/HEAD) fix(auth): unify server Supabase client with @supabase/ssr and await cookies(); update routes/pages to await getSupabaseServerClient; fix callback cookie write order; ensure build green; improve reliability of SSR/middleware auth
7b562f8 docs(history): append full commit list since 2025-11-13 for web/ scope
7b810fc docs: add consolidated change history for auth/membership gating incident (Nov 17, 2025)
b00e19d fix(build): define redirect response before attaching fallback sb-* cookies in auth callback
35c93ab fix(auth): explicitly set sb-* Supabase cookies (domain + .4 variants) so SSR/middleware see session\n\n- /api/auth/session: set httpOnly cookies with Domain=apex (or SUPABASE_COOKIE_DOMAIN), path=/\n- also set/remove .4 suffixed variants some SDKs read\n- /auth/callback: fallback cookie write after exchangeCodeForSession\n- adds console logs to verify cookie writes
d7ec2c1 chore: tiny doc touch to trigger redeploy (pick up env changes)
90324c1 Fix(types): await headers() in async contexts; avoid synchronous headers() usage in SSR helpers\n\n- Trip Builder layout: await next/headers()\n- membership + server SSR client: await next/headers() only where allowed\n- SSR helper: avoid calling headers() synchronously; fallback rid capture\n- No behavior change; fixes TS error in layout.tsx
fb358d2 Debug: add correlation id propagation (x-fz-req-id)\n\n- Middleware: generate req id, attach to request+response headers, log rid\n- SSR clients and membership: read rid from headers and include in logs\n- Trip Builder layout, auth callback, checkout route: include rid in logs\n- No behavior changes beyond logging/headers
5c49e7c Debug: add comprehensive console logging for auth/membership flow\n\n- Middleware: log request, cookies, auth result, membership decision\n- SSR clients: log cookie access and service client init\n- Membership checks: log user and profile fetch results\n- Trip Builder layout: log access decisions\n- Auth callback: detailed logging for code exchange and cookies\n- Client pages: login, paywall, auth modal with flow logs\n- Checkout route: server-side logs for user and redirect URL\n- Activation page: log activation API call + response
b25c608 Build: mark Trip Builder route dynamic (cookies/session) to silence static build warning
97075cd Fix: consistent membership gating + SSR client typing
7343b81 membership persists across entire site
ce8492b membership persists across entire site
5b2a15a fixing screen reset on trip builder
49751f6 Supabase browser client: set unique storageKey ('wc26fanzone-auth') to prevent Multiple GoTrueClient collisions across contexts; should eliminate warnings and token races.
c1c609b Supabase client: unify browser usage to singleton (reuse supabaseClient.ts) to prevent multiple GoTrueClient instances and refresh token 400s.
7442cc4 Add server-side gate for Trip Builder: app/planner/trip-builder/layout.tsx checks session + membership and redirects to login or paywall before render.
6e52a18 Revert canonical host redirect in middleware to stop www<->apex loop (ERR_TOO_MANY_REDIRECTS).
c9f465f Middleware: add canonical host redirect from www.* to apex to unify auth cookies across domains; prevents /login flash when visiting
 tool pages.
f704896 Account UI: remove tier/status line from ProfileCard; Add server-side /logout route and wire Header sign-out to use it for reliable 
sign-out across environments.
7ff8a22 Middleware: gate only tool pages (/planner/trip-builder, /flight-planner, /lodging-planner, /onboarding) and check membership direct
ly via SSR client to avoid cookie issues; keep planner hub public.
bc40576 lemon-webhook: wrap signature verify in try/catch and avoid 500 on missing service creds; always ack with 200 for non-auth failures.
9a3c0e4 lemon-webhook: use global Web Crypto API; remove std crypto import for Edge runtime stability.
b9354a8 lemon-webhook: read service role from SERVICE_ROLE_KEY/SERVICE_ROLE (Supabase UI forbids SUPABASE_* custom secrets).
8b9cd4c Add Supabase Edge Function 'lemon-webhook' to handle Lemon Squeezy fulfillment server-side (signature verification, profile activati
on, purchase upsert).
e4968a1 Paywall CTA: switch to direct buy endpoint (/api/checkout/member) to avoid store/variant requirements; environment aligns with LEMON
_MEMBER_PRODUCT_IDS only
c541380 Auth flow: force magic link redirect to paywall; adjust EmailOtpVerify fallback to paywall; and prevent auth callback from overridin
g paywall redirect with onboarding
745f1b8 Membership gating flow fixes: add non-localized paywall, enforce onboarding redirect after checkout, align checkout success/cancel U
RLs, remove localized paywall file, align protected routes, and support LEMON_API_KEY fallback
b9b9de4 Simplify auth redirect targets
6616a72 Fix OTP redirect gating
3666f5a Tighten membership gating redirects
e7dfb44 Implement membership paywall and checkout flow
77e5015 Emergency update: Remove gating and simplify navigation
e272f41 Direct homepage CTA to Lemon checkout
ccec1b4 Fix Supabase server auth visibility and add checkout logging
60d5575 Fix membership page freeze - remove client-side auth check
39e283b (origin/gating_rebuild, gating_rebuild) Complete membership gating rebuild - clean  system
602b31c REMOVE MEMBERSHIP GATE FROM PLANNER HUB - Allow direct access to Trip Builder for all users
8cf0d52 Remove membership gating from all planners - open access to Trip Builder, Flight Planner, and Lodging Planner
f3197df Fix: Add conditional client-side membership linking in Planner Hub
b08e2ec Fix: Remove unreliable middleware-level membership gating
417da59 Fix: Check for correct Supabase auth cookie name pattern + use service role for membership checks
55126e3 Fix: Use service role client for membership checks in middleware to bypass RLS
bfa8a86 Build fix: use createServerClient from @supabase/ssr in middleware (package version lacks createMiddlewareClient); retain improved g
ating behavior
6d07b40 Middleware: switch to createMiddlewareClient for reliable auth in edge; if membership check throws, allow and let API enforce; inclu
de gate=not_member hint on redirects
6ef7ea0 Account/Profile: add visible 'Membership active' chip derived from profiles (is_member/account_level/tier+status)
f32dbea Activation fallback: if no customers found, scan recent orders by email with included order-items and match by product/variant/name
063af4e Activation + gating robustness: support member VARIANT IDs and name-based fallback; record ls_variant_id; isActiveMember checks purc
hases.ls_variant_id too
87632b6 Account page: merge membership flags from profiles with user_profile so account tier displays correctly and reflects admin grants/ac
tivation
9e87001 Fix activation: avoid unsupported /orders filters/sort; filter matching orders client-side by email/customer and link order-items to
 orders
aa9de52 Admin users update: use upsert on profiles (onConflict user_id) so Grant Membership works even if profile row is missing
9ce2baa Admin UX tweaks: default /admin -> /admin/users; move blog dashboard to /admin/blog; fix AdminLayout profile query for envs without 
profiles.id; update sidebar Blog link
f8e6bcf Make /admin use dashboard layout: remove duplicate /admin/page, redirect /admin/dashboard -> /admin to ensure sidebar renders
d7fe6ae Fix TS error: replace unsupported Postgrest .group() with client-side aggregation for purchases count in admin users list
07faa3e Fix admin users list: replace unsupported getUserByEmail with profile email lookup + admin.getUserById + fallback scan
918ec80 Fix Next route conflict: move Analytics under dashboard layout and remove duplicate /admin/analytics page
6783ead Admin dashboard overhaul: add Users management with full details and admin actions, secure list/update API routes; add Analytics int
o dashboard layout; update sidebar to Users/Blog/Analytics
4315d6f Add self-serve membership activation flow via Lemon API; wire checkout success_url; fix membership gating fallback\n\n- Add POST /ap
i/membership/activate to verify purchases using Lemon API and update profiles/purchases\n- Add /memberships/activate page for users to trigg
er activation or provide checkout email\n- Set checkout[success_url] to activation page and cancel_url to memberships\n- Fix membership.ts b
race bug and keep purchases fallback\n- Add ‘Already purchased? Activate access’ link on memberships page
f158726 CRITICAL FIX: Correct isActiveMember query to fix membership gating
c8acc8d CRITICAL FIX: Correct isActiveMember query - was using malformed .or() preventing membership checks
125f21f CRITICAL: Fix webhook bot protection blocking - add skip headers and use custom_data user_id
bc184b2 Add runtime config to webhook route
7559a28 Remove invalid vercel.json runtime config causing build error
ddafcaa Trigger redeploy after disabling auth
0f69148 Add vercel.json to register lemon webhook
48920f8 Add vercel.json to register lemon webhook
06860a6 Add vercel.json to register lemon webhook
5ae8502 Add vercel.json to register lemon webhook
bead48a iddleware patch for memberships
9049fd0 chore: update DB notes; remove now-unused lemonsqueezy webhook route
9f4cf40 auth: attach purchases to user on sign-in (soft RPC)
5836c6a chore: add database_update.md notes
365966a fix(blog): use server Supabase client in SSG/SSR and filter to published posts to resolve server component error
592f123 Trigger blog page redeploy
c8bbd9e Trigger blog page redeploy
c49178f blog: apply additional copy/styling tweaks on dynamic post page
cdde2b8 blog: minor patch to dynamic post page
b7e7db0 blog: apply revisions to dynamic post page; remove outdated blog index
c8f9095 Merge hotfix: admin blog manual draft + auth session sync + transit seed tool
6652b40 (origin/hotfix/admin-blog, hotfix/admin-blog) security: restrict seed-transit API to ADMIN_EMAILS allowlist
8ff569a admin: add seed-transit tool and API to publish transit article into CMS (blog_posts)
aa6c45c admin: add New Blank Draft flow and link from generator; enable manual blog writing via CMS
b263fec auth: add /api/auth/session to sync Supabase cookies from client; blog: add reusable BlogArticle shell for future posts
8270cd6 (tournament) admin: add New Blank Draft flow and link from generator; enable manual blog writing via CMS
bd152ee (refs/stash) On tournament: temp: blog page local changes
b648b24 index on tournament: 8270cd6 admin: add New Blank Draft flow and link from generator; enable manual blog writing via CMS
1d170ba untracked files on tournament: 8270cd6 admin: add New Blank Draft flow and link from generator; enable manual blog writing via CMS
b4c8fc5 (origin/tournament) auth: add /api/auth/session to sync Supabase cookies from client; blog: add reusable BlogArticle shell for futur
e posts
a45ba7c blog: replace markdown render with styled TSX article + Next/Image and internal public image paths
8f34437 blog: restyle transit-friendly lodging zones article with site layout and Next/Image; add hero and section images in public/
39eb61f fix(ts): annotate callback params in tournament pages/components to satisfy noImplicitAny
cc10046 fix(ts): annotate flatMap and map callback params in tournament hub page to satisfy noImplicitAny
1e6a072 fix(ts): correct citiesMap reference (use citiesById) in tournament match page
4ba5673 fix(ts): annotate city mapping in tournament pages to avoid implicit any; use typed reduce
fe262b6 fix(ts): annotate reduce accumulator type in tournament admin
31f7772 fix(ts): type cities map in tournament admin to avoid implicit any
dbc2ceb gate tournament: return 404 unless ENABLE_TOURNAMENT=true; keep nav hidden
7d0cdbe sitemap: add transit-friendly lodging zones blog post
f94ae25 Add transit-friendly lodging zones blog + city guide callouts; hide Tournament in nav via feature flag
6a540d7 (origin/hotfix/transit-blog, hotfix/transit-blog) Add transit-friendly lodging zones blog + city guide callouts; hide Tournament in 
nav via feature flag
3bb26de feat(tournament): scaffold v1 tournament hub + match pages with anonymous voting and comments; add comment upvotes, share buttons, c
ity guide CTAs, flags, countdowns, vote threshold; admin endpoint + page; SQL migrations + seeds; docs.\n\n- Add DB schema (021) + comment v
otes (022)\n- Seed scripts for tournament + launch votes\n- New routes: /tournament, /tournament/[slug], API for votes/comments/upvotes/news
letter\n- Components: MatchCard, VotingButtons, ResultsBar, Countdown, Comments (modal), ShareButtons, SimpleBracket\n- UX: Hidden percentag
es until 100 votes, per-city badges, "You voted" cookie badge\n- Flags for US/CA/MX; round headers; hub bracket pair hints\n- Middleware coo
kie for anonymous voters\n- Minimal admin controls to set status/winner\n- Docs: final dev instructions\n\nNote: commit only; no push.
cf82098 Merge branch 'guides': city guides buy CTAs + Lemon Squeezy links
d337b0c (guides) Guides: add Lemon Squeezy buy CTAs and hosted buy links for all city guides; update listing badges and card CTAs
3df88e3 fix(auth): redirect and refresh after sign-out; await signOut in header menu to avoid stale /account state
d31caaf fix(auth): reliable sign-out by syncing SSR cookies; enhance client onAuthStateChange to POST /api/auth/session; include member chec
kout route tweak
b08017d docs: minor profiles.md tweak to trigger redeploy
9ac961a fix(migration 020): defensively add profiles membership columns and drop/recreate active_members to avoid missing column errors
47ed217 feat(membership): add attach_purchases_to_user RPC + active_members view; enrich LS webhook to store customer/subscription fields an
d variant; call reconcile on sign-in
a3f6705 feat(membership): harden profiles schema + upsert via webhook + fallback membership check via purchases
14efc9b chore(memberships): propagate current query string to checkout endpoints to support discount codes and diagnostics
a0cee00 chore(checkout): add ?inspect=1 diagnostics to member and bundle endpoints to echo resolved env and final redirect
dc4d6c7 fix(webhook): guard MailerLite add when email is missing to satisfy types and runtime safety
e544826 docs(env): add LS_MEMBER_BUY_URL and LS_BUNDLE4_BUY_URL to example
f93aec5 feat: purchases table + webhook upsert + email-locked checkout + account purchases UI
4b8fcf2 chore: trigger deploy after membership env updates (docs note)
b5472a3 fix(memberships): use server checkout endpoints as fallback; add /api/checkout/member and /api/checkout/bundle4; middleware accepts 
NEXT_PUBLIC_ADMIN_EMAILS fallback
9812dbb Merge gating to main: membership gating + SSR header perf
b8a2d08 (origin/gating, gating) feat(gating): bundle gating changes (membership gating UI, middleware, webhooks, memberships pages, marketin
g assets) for production
36f371a perf(account/header): SSR session prefetch and initial AuthContext hydration for instant navbar render
d3db626 Demo: autoplay Canva on click and update duration to 90 seconds
d8a8342 Homepage: switch DemoSection to Canva embed for demo video; defer MP4 until finalized
080d776 ui/auth: ensure modals sit above Leaflet; hide maps when modal open; auth callback/resend uses runtime origin
5851aaf ui: hide Leaflet maps and lock background when modals open
28e8a28 auth: add OTP fallback and magic link recovery
6b2d2f4 footer: add Facebook link and icon to social row
6c40c1c footer: wire social links (Instagram, YouTube, X, Reddit) to live profiles
8d583bf admin: add protected /api/admin/analytics backed by analytics_overview view
e948f89 admin login
cc70c4a i18n: localize new homepage HeroMap (title, subtitle, CTAs) across en/es/fr/pt/de/ar; add compact timer variant and map framing opti
ons
ec845ea Trip Builder: add guest Step 1 (home airport, group, prefs) and fix MatchPicker list keys
002e8c9 fix(guides): align schedule types to JSON and keep table below header
055f129 Fan Zone UI + Planner: maps, schedule table below hero, tighter hero, Beehiiv CTA, Leaflet client-only fallback, public planner acce
ss, match_dates.json, i18n namespace fix
da507dd Add CTA sections to groups pages and fix Map SSR issues
3e17f22 Add multi-language AI support and fix missing French cards translations - Add AI language instructions for French, Portuguese, Arabi
c (not just Spanish) - Add missing results.cards translations to French (citiesLabel, viewDetails, hideDetails) - AI will now generate itine
rary content in user's selected language
13abf73 Trigger fresh build - clear deployment cache
081a37f Force Vercel rebuild - clear cache after localization updates
e8fc73a Complete Arabic trip planner localization - Add review.common.separator - Add complete loader translations (header, progress, contex
t, all flight/lodging/trip messages) - Add complete results sections (flights, lodging, matchDay, insider, timeline, cta, actions, alerts, b
udgetLevels, cards) - Arabic now 100% complete matching English, Spanish, Portuguese, French
31dbcd0 Complete Spanish trip planner localization: loader + results sections - Add loader translations (header, progress, context, messages
 for flight/lodging/trip) - Add results translations (sections, timeline, cta, actions) - Add common.separator to review namespace - Fix Pro
fileReview translation key display - Verified: 214 total keys, 100% coverage for Spanish
9e4f604 Add missing common.separator translation key to fix ProfileReview display
5bbc28f Add timeout and error handling to AuthContext loading state
1b27981 fix: correct JSON syntax and use explicit imports for i18n messages
448589d fix: use explicit imports for i18n messages to avoid Turbopack bundling issues
cb5de31 fix: force Vercel rebuild after JSON syntax fixes
4991dd5 fix: resolve build errors for Spanish localization
27ac08b feat: Spanish localization for Trip Builder with AI
b657527 Fix Dallas guide download link
289d3d3 Fix Dallas guide download link
7bb9e9b Integrate MailerLite onboarding sync
3c20033 Add consent-based analytics and expand sitemap
0258052 Add groups best-of guides and link new routes
: