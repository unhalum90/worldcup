# Add Purchases Section — World Cup 26 Fan Zone

## Goal
When a user purchases a guide, bundle, or membership via Lemon Squeezy, the purchase automatically appears in their **My Account → Purchases** section.

This system connects **Lemon Squeezy → Webhook → Supabase → Frontend**.

---

## 1. Database Table

Create a new table in Supabase named `purchases`:

```sql
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  amount numeric,
  license_key text,
  purchased_at timestamptz default now()
);


⸻

2. Webhook Handler

Add a new API route in your Next.js project:

File: /app/api/webhooks/lemonsqueezy/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (hash !== signature)
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  const event = JSON.parse(rawBody);

  if (event.meta.event_name === "order_created") {
    const data = event.data.attributes;
    const email = data.user_email;
    const productName = data.first_order_item.name;
    const license = data.first_order_item.license_key;

    // Match to existing profile by email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profile) {
      await supabaseAdmin.from("purchases").insert({
        user_id: profile.id,
        product_id: data.first_order_item.product_id,
        product_name: productName,
        amount: data.total,
        license_key: license,
      });
    }
  }

  return NextResponse.json({ received: true });
}


⸻

3. Frontend Integration

In your /account page, fetch user purchases:

const { data: purchases } = await supabase
  .from("purchases")
  .select("*")
  .eq("user_id", session.user.id)
  .order("purchased_at", { ascending: false });

Render the Purchases card:

<Card title="Purchases">
  {purchases.length === 0 ? (
    <p>No purchases yet.</p>
  ) : (
    purchases.map((p) => (
      <div key={p.id} className="flex justify-between border-b py-2">
        <span>{p.product_name}</span>
        <span>€{(p.amount / 100).toFixed(2)}</span>
      </div>
    ))
  )}
</Card>


⸻

4. Lemon Squeezy Webhook Setup
	1.	Go to Lemon Squeezy → Settings → Webhooks.
	2.	Add endpoint:

https://worldcup26fanzone.com/api/webhooks/lemonsqueezy


	3.	Subscribe to events:
	•	order_created
	•	license_created
	4.	Copy the webhook secret and paste it into your .env file:

LEMONSQUEEZY_WEBHOOK_SECRET=xxxxxxxx



⸻

5. Result
	•	Each new order triggers the webhook.
	•	Purchases are verified and stored in Supabase.
	•	The Purchases section in the user’s account displays product name, amount, and purchase date.
	•	Works seamlessly for single-city guides, 4-city bundles, and memberships.

⸻

Deliverable Complete.

