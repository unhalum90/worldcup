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

