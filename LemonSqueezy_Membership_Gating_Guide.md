# 🟣 Lemon Squeezy Membership Gating — Dev Implementation Guide
**Project:** World Cup 26 Fan Zone  
**Purpose:** Restrict premium features (Planner, Groups, Teams, Calculators) to active Lemon Squeezy subscribers.

---

## 1. Webhook Setup

### ✅ Create Webhook in Lemon Squeezy
- **Callback URL:**  
  https://worldcup26fanzone.com/api/webhooks/lemonsqueezy
- **Signing Secret:**  
  worldcup__subscriber
- **Enabled Events:**  
  - order_created  
  - subscription_created  
  - subscription_cancelled  
  - subscription_expired  

### 🔒 Environment Variables (in Vercel)
```bash
LEMONSQUEEZY_WEBHOOK_SECRET=worldcup__subscriber
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

---

## 2. API Route for Webhooks
Path: `/app/api/webhooks/lemonsqueezy/route.ts`
```ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (computed !== signature)
    return new NextResponse("Invalid signature", { status: 400 });

  const event = JSON.parse(rawBody);
  const type = event.meta.event_name;

  if (type === "order_created" || type === "subscription_created") {
    const email = event.data.attributes.user_email;
    const status = event.data.attributes.status;
    const product = event.data.attributes.product_name;

    await supabase
      .from("profiles")
      .update({
        is_member: true,
        membership_status: status,
        membership_product: product,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
  }

  if (type === "subscription_cancelled" || type === "subscription_expired") {
    const email = event.data.attributes.user_email;

    await supabase
      .from("profiles")
      .update({
        is_member: false,
        membership_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
  }

  return NextResponse.json({ received: true });
}
```

---

## 3. Database Requirements

Table: `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | user id |
| email | text | unique user email |
| is_member | boolean | true if active subscription |
| membership_status | text | active, cancelled, expired, etc. |
| membership_product | text | World Cup 26 Fan Zone Membership |
| updated_at | timestamptz | auto-updated timestamp |

Ensure Row Level Security is active and controlled via Supabase Auth.

---

## 4. Gating Logic in Frontend
File: `/middleware.ts`
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const session = await supabase.auth.getSession();
  const user = session?.data?.session?.user;

  const premiumRoutes = ["/planner", "/teams", "/groups"];
  const isPremiumRoute = premiumRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (isPremiumRoute && user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_member")
      .eq("id", user.id)
      .single();

    if (!data?.is_member)
      return NextResponse.redirect(new URL("/membership", req.url));
  }

  return NextResponse.next();
}
```

---

## 5. Validation Test Flow
1. Purchase membership in Lemon Squeezy → triggers webhook.  
2. Supabase profiles → is_member becomes true.  
3. Log in to site → access /planner and /teams allowed.  
4. Cancel membership → webhook flips is_member to false.  
5. Subsequent access redirects to /membership.

---

## 6. Optional: Admin Dashboard Check
Add a small Supabase view or card:
```sql
SELECT email, is_member, membership_status, updated_at
FROM profiles
ORDER BY updated_at DESC;
```
Verify webhook events processed correctly.

---

**Result:**  
Membership is now fully gated through Lemon Squeezy + Supabase, automatically updating access based on active subscription status.
