This is excellent self-correction\! You've correctly identified the potential path conflict in the file structure: using `/membership/activate/route.ts` might conflict with an existing `/memberships/activate/page.tsx` or `/api/membership/activate/route.ts` if those exist.

Your proposal to **update the existing API route to match the new spec** is the most efficient and robust way forward. Based on the file list you previously provided, there is an existing API route here:

  * `web/app/api/membership/activate/route.ts`

We will proceed by **updating this file** to include the Lemon Squeezy API logic from the plan.

Here is the updated and consolidated file package for your dev team. This package ensures the Activation flow is rock-solid and the Gating flow uses the secure Server Component architecture.

-----

## 🚀 Updated Implementation Package: Consolidated Fix

This package updates the existing activation endpoint and implements the secure Server Component gating.

### Phase 1: New Files and Helpers (As Planned)

#### 1\. Create Supabase Admin Client Helper

| File Path | Action |
| :--- | :--- |
| **`web/lib/supabaseAdmin.ts`** | ➕ **NEW FILE** |

```typescript
// web/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// Utility function to ensure HTTPS protocol
function normalizeToHttps(u: string): string {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return u.replace(/^http:\/\//i, 'https://');
  }
}

const supabaseUrl = normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Supabase client initialized with the Service Role Key.
 * This client bypasses RLS for server-to-server operations.
 * USE ONLY IN SERVER COMPONENTS, API ROUTES, OR ROUTE HANDLERS.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

#### 2\. Update Existing Membership Activation Route (Critical Step)

This updates the existing API route to perform the server-side Lemon Squeezy verification and database update.

| File Path | Action |
| :--- | :--- |
| **`web/app/api/membership/activate/route.ts`** | ✏️ **UPDATE EXISTING FILE** |

```typescript
// web/app/api/membership/activate/route.ts
// NOTE: This file is an API Route handler, not a page.
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin' // Service Role client

const LEMON_API_KEY = process.env.LEMON_API_KEY!
const MEMBERSHIP_PRODUCT_ID = Number(process.env.NEXT_PUBLIC_LS_MEMBER_PRODUCT_ID || '0')
const DEFAULT_REDIRECT = process.env.NEXT_PUBLIC_MEMBER_DEFAULT_REDIRECT || '/planner/trip-builder'

// Types for Lemon Squeezy API response structure
type LemonOrder = {
  id: string
  type: string
  attributes: {
    status: string
    user_email: string | null
    email: string | null
  }
}

type LemonOrderItem = {
  id: string
  type: string
  attributes: {
    product_id: number
    variant_id: number
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get('order_id')
  const emailFromQuery = url.searchParams.get('email')
  const redirectPath = url.searchParams.get('redirect') || DEFAULT_REDIRECT
  
  // NOTE: Lemon Squeezy must be configured to redirect here with these params.
  if (!orderId) {
    return NextResponse.redirect(new URL(`/memberships?error=missing-order`, req.url))
  }

  try {
    // 1. Fetch order from Lemon Squeezy (includes order-items for verification)
    const orderRes = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderId}?include=order-items`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_API_KEY}`,
          Accept: 'application/vnd.api+json'
        },
        cache: 'no-store'
      }
    )

    if (!orderRes.ok) {
      console.error('Lemon order fetch failed', orderRes.status)
      return NextResponse.redirect(new URL(`/memberships?error=order-failed`, req.url))
    }

    const orderJson = await orderRes.json()
    const order = orderJson.data as LemonOrder
    const orderEmail =
      (order.attributes.user_email || order.attributes.email || emailFromQuery || '')
        .trim()
        .toLowerCase()

    if (order.attributes.status !== 'paid' || !orderEmail) {
      return NextResponse.redirect(new URL(`/memberships?error=not-paid`, req.url))
    }

    // 2. Extract and verify product_id from included order items
    // Lemon Squeezy API response includes related resources in the 'included' array
    const orderItems = (orderJson.included as (LemonOrderItem | LemonOrder)[]) // Handle heterogeneous types
      .filter(item => item.type === 'order-items') as LemonOrderItem[]; 

    const isMembershipProduct = orderItems.some(item =>
        item.attributes.product_id === MEMBERSHIP_PRODUCT_ID
    );

    if (MEMBERSHIP_PRODUCT_ID && !isMembershipProduct) {
      return NextResponse.redirect(new URL(`/memberships?error=wrong-product`, req.url))
    }

    // 3. Update Supabase profile using admin client (Service Role)
    const updateData = {
      is_member: true,
      account_level: 'member',
      member_since: new Date().toISOString()
    };
    
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('email', orderEmail) // Match on email, which should be present from initial login/profile creation

    if (updateErr) {
      console.error('Supabase profile update/insert error', updateErr)
      // Log the error but continue to redirect the user to prevent a bad UX
    }

    // 4. Redirect user into the app
    const safeRedirect = redirectPath.startsWith('/') ? redirectPath : DEFAULT_REDIRECT
    // Use /memberships/page as an intermediate confirmation page if you have one, or direct to planner
    return NextResponse.redirect(new URL(safeRedirect, req.url)) 
  } catch (err) {
    console.error('Membership activation exception', err)
    return NextResponse.redirect(new URL(`/memberships?error=exception`, req.url))
  }
}
```

### Phase 2: Secure Server Component Gating

#### 3\. Rename Client Component

| File Path | Action |
| :--- | :--- |
| **`web/app/planner/trip-builder/page.tsx`** | ➡️ **RENAME TO:** `web/app/planner/trip-builder/trip-builder-client.tsx` |

#### 4\. Create Server Component Gate

| File Path | Action |
| :--- | :--- |
| **`web/app/planner/trip-builder/page.tsx`** | ➕ **NEW FILE** |

```typescript
// web/app/planner/trip-builder/page.tsx - Server Component Gate
import { redirect } from 'next/navigation';
import { createClient as createSSRClient } from '@/lib/supabase/server'; 
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // New Service Role client
import { isActiveMember } from '@/lib/membership';
import TripBuilderClient from './trip-builder-client'; // The renamed client component

export default async function TripBuilderGate() {
  const supabase = await createSSRClient(); 

  // 1. Check Authentication (must use SSR client to read cookies)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect unauthenticated user to login
    return redirect(`/login?redirect=/planner/trip-builder`);
  }

  // 2. Check Membership Status (reliably, using Service Role to bypass RLS)
  const isMember = await isActiveMember(supabaseAdmin, user.id); 

  if (!isMember) {
    // If authenticated but not a member, redirect to the memberships page
    return redirect(`/memberships?from=planner&redirect=/planner/trip-builder`);
  }

  // 3. Success: User is authenticated and a member. Render the client component.
  return <TripBuilderClient />;
}
```

#### 5\. Clean Up Middleware

| File Path | Action |
| :--- | :--- |
| **`web/middleware.ts`** | ✏️ **MODIFY** |

**Action:** Ensure no logic performs a redirect based on `/planner` routes or membership status. **Specifically, remove the entire "Optional onboarding gate" block** (the `if (gateEnabled && user?.id && supabase)` block around line 97) to eliminate all known sources of unpredictable Edge Runtime failure.

#### 6\. Clean Up Planner Hub Link

| File Path | Action |
| :--- | :--- |
| **`web/app/planner/page.tsx`** | ✏️ **MODIFY** |

**Action:** In the `PhaseCard` component, remove the now-redundant client-side conditional logic and link directly to the target page.

```typescript
// web/app/planner/page.tsx (Fragment in PhaseCard)
// ...
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={phase.href} // <-- FIXED: Link directly to the protected page
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {phaseT('howItWorks.cta.open')}
              </Link>
              {/* ... (demo link) */}
            </div>
// ...
```