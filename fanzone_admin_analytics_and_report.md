# 📊 World Cup Fan Zone — Admin Analytics + Daily Report System

**Goal:** Track and report user activity (signups, trip/flight/lodging planners) via a Supabase dashboard and daily email.

---

## 1️⃣ Database Setup — Analytics View

**File:** `db/migrations/016_analytics_overview.sql`

```sql
CREATE OR REPLACE VIEW analytics_overview AS
SELECT
  CURRENT_DATE::date AS report_date,
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM auth.users WHERE created_at >= now() - INTERVAL '1 day') AS new_users_24h,
  (SELECT COUNT(*) FROM travel_plans) AS total_trip_plans,
  (SELECT COUNT(*) FROM travel_plans WHERE created_at >= now() - INTERVAL '1 day') AS trip_plans_24h,
  (SELECT COUNT(*) FROM trip_sessions WHERE flights_data IS NOT NULL) AS flight_plans_total,
  (SELECT COUNT(*) FROM trip_sessions WHERE flights_data IS NOT NULL AND created_at >= now() - INTERVAL '1 day') AS flight_plans_24h,
  (SELECT COUNT(*) FROM lodging_plans) AS lodging_plans_total,
  (SELECT COUNT(*) FROM lodging_plans WHERE created_at >= now() - INTERVAL '1 day') AS lodging_plans_24h;

ALTER VIEW analytics_overview SET (security_invoker = false);
```

✅ **Notes:**
- Uses the existing `travel_plans`, `trip_sessions`, and `lodging_plans` tables present in the project.
- The caller must authenticate with the service role (anon clients will be blocked by RLS when the view touches `auth.users`).

---

## 2️⃣ Edge Function — Daily Email Report

**File:** `supabase/functions/daily-report/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!,
  );

  const { data: stats, error } = await supabase
    .from("analytics_overview")
    .select("*")
    .single();

  if (error || !stats) {
    console.error("Analytics query failed:", error);
    return new Response("Error fetching analytics", { status: 500 });
  }

  const body = `
  📊 Fan Zone Daily Report
  -------------------------
  Date: ${stats.report_date}
  New Users (24h): ${stats.new_users_24h}
  Total Users: ${stats.total_users}
  Trip Plans (24h): ${stats.trip_plans_24h}
  Total Trip Plans: ${stats.total_trip_plans}
  Flights Generated (24h): ${stats.flight_plans_24h}
  Total Flights Generated: ${stats.flight_plans_total}
  Lodging Plans (24h): ${stats.lodging_plans_24h}
  Total Lodging Plans: ${stats.lodging_plans_total}
  `;

  const toEmail = Deno.env.get("REPORT_EMAILS") || "eric@worldcup26fanzone.com";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Fan Zone Reports <reports@worldcup26fanzone.com>",
      to: [toEmail],
      subject: `Fan Zone Daily Report – ${stats.report_date}`,
      text: body,
    }),
  });

  return new Response("OK");
});
```

---

## 3️⃣ Schedule Function

In Supabase Dashboard → **Edge Functions → daily-report → Schedule**

**Cron Expression:**  
```
0 8 * * *
```
(Triggers daily at 08:00 UTC / 09:00 CET)

---

## 4️⃣ Environment Variables

Add to Supabase **Function Secrets** or `.env.local`:

| Variable | Example Value | Purpose |
|-----------|----------------|----------|
| `SUPABASE_URL` | `https://xyzcompany.supabase.co` | Your project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `service-role-key` | Full-access key for backend queries |
| `RESEND_API_KEY` | `re_xxxxxxx` | API key for email sending |
| `REPORT_EMAILS` | `eric@worldcup26fanzone.com` | Comma-separated recipients |

---

## 5️⃣ Admin Dashboard (Frontend)

**Server API:** `web/app/api/admin/analytics/route.ts`

```tsx
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("analytics_overview").select("*").maybeSingle();

  if (error || !data) {
    console.error("[Analytics] failed to load overview", error);
    return NextResponse.json({ error: "analytics_unavailable" }, { status: 500 });
  }

  return NextResponse.json({ stats: data });
}
```

**Client page:** `web/app/admin/analytics/page.tsx`

```tsx
import useSWR from "swr";

type Stats = {
  report_date: string;
  total_users: number;
  new_users_24h: number;
  total_trip_plans: number;
  trip_plans_24h: number;
  flight_plans_total: number;
  flight_plans_24h: number;
  lodging_plans_total: number;
  lodging_plans_24h: number;
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
});

export default function AnalyticsDashboard() {
  const { data, error } = useSWR<{ stats: Stats }>("/api/admin/analytics", fetcher, { refreshInterval: 60_000 });

  if (error) return <p className="text-red-500">Unable to load analytics.</p>;
  if (!data) return <p className="text-gray-400">Loading analytics...</p>;

  const stats = data.stats;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Fan Zone Admin Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="New Users (24h)" value={stats.new_users_24h} />
        <StatCard label="Trip Plans (24h)" value={stats.trip_plans_24h} />
        <StatCard label="Total Trip Plans" value={stats.total_trip_plans} />
        <StatCard label="Flights Generated (24h)" value={stats.flight_plans_24h} />
        <StatCard label="Total Flights Generated" value={stats.flight_plans_total} />
        <StatCard label="Lodging Plans (24h)" value={stats.lodging_plans_24h} />
        <StatCard label="Total Lodging Plans" value={stats.lodging_plans_total} />
      </div>
      <p className="mt-8 text-sm text-gray-500">Last updated: {stats.report_date}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-800 p-6 rounded-2xl shadow-lg text-center border border-neutral-700">
      <h2 className="text-xl font-semibold text-gray-300 mb-2">{label}</h2>
      <p className="text-4xl font-bold text-emerald-400">{value}</p>
    </div>
  );
}
```

✅ **Access Control:**  
Define a trusted list of admin emails (e.g., `ADMIN_EMAILS`) and gate `/admin/*` routes in `middleware.ts`:

```ts
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
if (pathname.startsWith("/admin")) {
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
```

## 6️⃣ Deployment Steps

1. ✅ Apply SQL migration (`016_analytics_overview.sql`)  
2. ✅ Deploy `daily-report` function  
3. ✅ Set environment variables  
4. ✅ Add `/api/admin/analytics` route + `/admin/analytics` page  
5. ✅ Schedule daily email (Supabase Cron)  
6. ✅ Verify email delivery + dashboard rendering  

---

**Deliverable Owner:** Eric Chamberlin  
**Dev Owner:** Backend + Frontend Dev Team  
**Version:** 1.0  
**Last Updated:** November 2025
\