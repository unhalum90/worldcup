# 🧠 WC26 Fan Zone — Brains Backend Plan (Auth + Context Persistence)

**Author:** Eric Chamberlin  
**Date:** Oct 22 2025  
**Stack:** Next.js 15 (App Router) | Supabase (Postgres + Auth + Storage) | Gemini API | TypeScript | Vercel | Lemon Squeezy (paywall)

---

## 1️⃣ System Overview
Authenticated users can access the **AI Travel Planner**, which consists of four independent yet connected “brains”:
1. `overview_brain` – itinerary generator  
2. `flights_brain` – flight routing + pricing  
3. `lodging_brain` – hotel/area logic  
4. `ground_brain` – transport + fan-fest guidance (phase 2)

Each brain consumes and writes to a single JSON context stored in Supabase per user session.

---

## 2️⃣ Authentication + Access Control

### Implementation
- **Supabase Auth (Email / OAuth)**  
  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  ```
- **RLS Policy** on `trip_sessions`:  
  ```sql
  CREATE POLICY "User owns session"
  ON trip_sessions
  FOR ALL
  USING (auth.uid() = user_id);
  ```

### Paywall / Feature Gate
- Gate routes under `/planner/*` with Lemon Squeezy subscription check.
  ```ts
  const sub = await getUserSubscription(user.id);
  if (!sub.active) redirect('/pricing');
  ```
- Cache subscription state in Supabase `user_subscriptions` table (updated via webhook).

---

## 3️⃣ Database Schema

### `trip_sessions`
```sql
CREATE TABLE trip_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_context JSONB NOT NULL,          -- base overview
  flights_data JSONB,                   -- flights brain output
  lodging_data JSONB,                   -- lodging brain output
  ground_data JSONB,                    -- future
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_trip_sessions_user ON trip_sessions(user_id);
CREATE INDEX idx_trip_sessions_updated ON trip_sessions(updated_at DESC);
```

---

## 4️⃣ Backend Flow (Brains Orchestration)

### a. Create / Update Context  
Triggered when Overview Brain completes.
```ts
await supabase.from('trip_sessions')
  .upsert({
    user_id,
    trip_context,
    updated_at: new Date(),
  });
```

### b. Pass Context to Next Brain  
Each brain route queries latest context:
```ts
const { data } = await supabase
  .from('trip_sessions')
  .select('trip_context')
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false })
  .limit(1);
```

### c. Generate Gemini Prompt  
```ts
const systemPrompt = `
You are the Flights Brain for the WC26 Fan Zone.
Use context to generate flight recommendations.
Return structured JSON.
`;

const userPrompt = JSON.stringify({
  tripContext: data.trip_context,
  task: 'Generate best flight routes and prices'
});
```

### d. Store Brain Output  
```ts
await supabase.from('trip_sessions')
  .update({ flights_data: geminiResponse, updated_at: new Date() })
  .eq('id', sessionId);
```

---

## 5️⃣ API Routes Structure (Next.js 15)

```
/app/api/brains/overview/route.ts
/app/api/brains/flights/route.ts
/app/api/brains/lodging/route.ts
/app/api/brains/ground/route.ts
```

Each route:
1. Validates Supabase Auth  
2. Fetches latest `trip_context`  
3. Builds system + user prompt  
4. Calls Gemini API  
5. Writes response → `trip_sessions`

### Example: `/api/brains/flights/route.ts`
```ts
import { createClient } from '@supabase/supabase-js';
import { google } from '@ai-sdk/google';
import { auth } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const supabase = createClient();
  const { user } = await auth(supabase);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const context = await supabase
    .from('trip_sessions')
    .select('trip_context')
    .eq('user_id', user.id)
    .single();

  const gemini = google('gemini-1.5-pro');
  const response = await gemini.generateText({
    systemInstruction: 'You are the Flights Brain...',
    input: {
      context: context.data.trip_context,
      userTask: body.task,
    },
  });

  await supabase.from('trip_sessions')
    .update({ flights_data: response, updated_at: new Date() })
    .eq('user_id', user.id);

  return Response.json(response);
}
```

---

## 6️⃣ Data Model Synchronization

| Table | Purpose | Linked Columns |
|--------|----------|----------------|
| `users` | Supabase Auth | id |
| `user_subscriptions` | Paywall status | user_id |
| `trip_sessions` | Core planner state | user_id → trip |
| `payments` | Lemon Squeezy receipts | user_id |

---

## 7️⃣ Security & Rate Limits
- Enforce `max 10 sessions / user` (cleanup cron job weekly).  
- Limit 3 Gemini API calls / minute per user via middleware throttle.  
- Log all Gemini responses for trace + debug.

```ts
if (await tooManyRequests(user.id)) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## 8️⃣ Output / Front-End Binding
Each brain returns normalized JSON:

```ts
{
  "status": "success",
  "brain": "flights",
  "generated_at": "2025-10-22T05:30:00Z",
  "data": {
    "routes": [
      { "airline": "Delta", "from": "ATL", "to": "DAL", "price": 320, "duration": "2h15" }
    ],
    "summary": "Direct Delta flights from ATL → DAL around $320."
  }
}
```

Front-end maps these into cards, and the “Add to Trip Plan” button updates `trip_sessions`.

---

## 9️⃣ Future Expansion Hooks
- `share_trip_link` → public read-only page (`/trip/[id]`)  
- `ai_revision_history` → optional log of Gemini prompt + response  
- Webhook triggers for analytics (trip creation, plan export)

---

## ✅ Phase 1 Completion Definition
- Authenticated users only.  
- One `trip_sessions` per user.  
- Overview + Flights Brains fully functional.  
- Context persistence verified between brains.  
- Gemini responses stored & displayed on front-end.
