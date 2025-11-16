# 🛠️ Comprehensive Build Plan: Frictionless Onboarding & Secure Payment

This plan combines the secure Lemon Squeezy integration with the desired user experience (UX) to create a streamlined sign-up, payment, and initial travel profile setup flow.

-----

## 1\. Project Goal & Overview

**Goal:** Implement a secure, server-side payment and webhook flow to gate access to the core planning tools (`Trip Builder`, `Flight Planner`, `Lodging Planner`) behind a required user sign-in and purchase. The process must be seamless and end with a quick, 3-step travel profile setup.

**Key Principle:** **Authentication precedes Payment.** The user's Supabase `user_id` must be available *before* the Lemon Squeezy checkout link is generated to ensure secure webhook processing.

-----

## 2\. Environment & Database Verification

The following items are confirmed to be set up and must be used in the implementation:

### 2.1. Environment Variables (Vercel)

| Variable | Value/Status | Use | Source |
| :--- | :--- | :--- | :--- |
| `LEMON_API_KEY` | Set | Used for creating the checkout session. | |
| `LEMON_WEBHOOK_SECRET` | `worldcup__subscriber` | **Critical** for verifying webhook signature. | |
| `LEMON_MEMBER_PRODUCT_IDS` | `688338` (or the associated **Variant ID**) | Used to specify the product/plan in the checkout API call. | |
| `NEXT_PUBLIC_SITE_URL` | Set | Used to construct the `redirect_url` after purchase. | (Inferred/Standard practice) |

### 2.2. Webhook Configuration (Lemon Squeezy)

| Configuration | Value | Status |
| :--- | :--- | :--- |
| **Callback URL** | `https://www.worldcup26fanzone.com/api/webhooks/lemon` | Confirmed endpoint URL. |
| **Signing secret** | `worldcup__subscriber` | Matches ENV variable. |
| **Events** | `order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `order_refunded`, `subscription_resumed` | Confirmed essential events are checked. |

### 2.3. Database Schema (Supabase)

| Table | Required Fields | Purpose | Source |
| :--- | :--- | :--- | :--- |
| `public.profiles` | `user_id`, `is_member` (boolean), `member_since`, `ls_customer_id` | **Membership status flag** and subscription tracking. | |
| `public.purchases` | `user_id`, `ls_order_id` (unique), `product_id`, `status`, `payload` | Audit log for completed transactions. | |
| `public.user_profile` | `home_city`, `group_size`, `budget_level`, etc. | Stores user's initial travel details gathered during onboarding. | |

-----

## 3\. Backend Implementation (Next.js Route Handlers)

### A. API Endpoint for Checkout Creation

**File:** `app/api/checkout/route.ts`
**Method:** `POST`

| Action | Implementation Detail |
| :--- | :--- |
| **1. Authenticate User** | Use Supabase server-side client (`createServerClient`) and call `await supabase.auth.getUser()`. Return a `401` if `!user`. |
| **2. Define Passthrough** | Create a `passthroughData` object containing the secure `user.id` and `user.email`. This data is the bridge between payment and webhook. |
| **3. Create Checkout** | Use `fetch` (or a dedicated SDK) to `POST` to `https://api.lemonsqueezy.com/v1/checkouts`. |
| **4. Embed Passthrough** | Set `attributes.checkout_data.custom` to the `passthroughData` object. |
| **5. Set Redirect** | Set `attributes.redirect_url` to a success-handling page on your site (e.g., `${NEXT_PUBLIC_SITE_URL}/membership/activate`). |
| **6. Return URL** | Extract `data.data.attributes.url` from the response and return it to the client. |

### B. Webhook Endpoint for Payment Processing

**File:** `app/api/webhooks/lemon/route.ts` (Matches configured Callback URL)
**Method:** `POST`

| Action | Implementation Detail |
| :--- | :--- |
| **1. Disable Body Parser** | Set `export const config = { api: { bodyParser: false } }` to read the raw request body. |
| **2. Verify Signature** | **CRITICAL SECURITY STEP.** Use Node's `crypto` module to verify the `X-Signature` header against the raw body and the `LEMON_WEBHOOK_SECRET` using `sha256` and `crypto.timingSafeEqual` (as shown in previous step). Return `401` if verification fails. |
| **3. Filter Events** | Parse the JSON payload. Only process `order_created` and `subscription_created` events. Return `200` for all other events to acknowledge receipt without action. |
| **4. Extract Passthrough** | Get the Supabase `user_id` from `payload.meta.custom`. |
| **5. Update Database** | **MUST use a Supabase client with the Service Role Key (`isAdmin: true`).** |
| | a. **Insert into `purchases`**: Log the transaction (`user_id`, `ls_order_id`, `product_id`, `status`). |
| | b. **Update `profiles`**: Set `is_member: true`, `member_since: now()`, and save `ls_customer_id` for future reference. |
| **6. Acknowledge Success** | Return a `200 OK` response. |

-----

## 4\. Frontend Implementation (UX/UI Flow)

### A. Access Gating Logic

All gated features (`Trip Builder`, `Flight Planner`, `Lodging Planner`) must check the user's status:

```typescript
const isGated = !isAuthenticated || !isMember; // isAuthenticated from Supabase, isMember from profiles table
```

### B. The 4-Phase User Journey

| Phase | User Action | System State | Frontend Action / UI |
| :--- | :--- | :--- | :--- |
| **1. Pre-Auth (Visitor)** | Clicks a gated feature (`Open Trip Builder`, `Start Planning`). | `!isAuthenticated` | **Display an Interstitial Modal:** "**Unlock Your Trip Planner**" with a clear **"Sign In"** button. |
| **2. Authentication** | Completes Magic Link Sign-In/Sign-Up. | `isAuthenticated`, `!isMember` | **Redirect to Paywall:** After auth, redirect to the new dedicated paywall page: `/membership/paywall`. |
| **3. Payment** | On `/membership/paywall`, clicks **"Get Full Access"**. | `isAuthenticated`, `!isMember` | **Client-Side:** Call `POST /api/checkout`. Receive `checkoutUrl`. Redirect user to the `checkoutUrl` immediately. |
| **4. Onboarding** | Completes payment & is redirected back to `/membership/activate`. | `isAuthenticated`, `isMember` (Set by webhook) | **Display 3-Step Onboarding Modal/Bar:** "Welcome\! Let's build your trip in 3 quick steps." The steps should capture data for the `user_profile` table. |

### C. Onboarding Implementation (Step 4 UI)

  * **Logic:** The 3-Step UI is only shown once. After completion, a flag (e.g., `user_profile.setup_complete`) should be set.
  * **Data Capture:** The three steps should collect and immediately persist essential data to the `public.user_profile` table:
    1.  **Travelers:** `group_size`, `children`, `seniors`, `mobility_issues`.
    2.  **Logistics:** `home_city`, `home_airport`, `preferred_transport`.
    3.  **Preferences:** `budget_level`, `food_preference`, `nightlife_preference`.
  * **Final Action:** Upon clicking **"Finish Setup"**, redirect the user to the main planning page (`/planner`) with their data pre-loaded.