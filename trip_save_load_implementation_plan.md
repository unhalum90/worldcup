# Trip Save & Load Feature Implementation Plan
**Project:** World Cup Fan Zone — Trip Builder Module  
**Feature:** Save & Load Itineraries  
**Version:** v1.0  
**Estimated Effort:** 0.5–1 day (8 hours max)  
**Author:** Eric Chamberlin / Project Management

---

## 🎯 Overview
This feature allows authenticated users to **save generated itineraries** from the Trip Builder and **access them later** through their account dashboard. It adds persistence, personalization, and long-term user engagement.

---

## 🧩 Data Model

### Table: `travel_plan_saved`

| Field | Type | Description |
|--------|------|--------------|
| `id` | `uuid` | Primary key (default: `gen_random_uuid()`) |
| `user_id` | `uuid` | References `auth.users.id` (for RLS) |
| `trip_input` | `jsonb` | Original Trip Builder input (origin, cities, match prefs, etc.) |
| `itinerary` | `jsonb` | Serialized itinerary JSON (the generated result) |
| `title` | `text` | User-defined or auto-generated (e.g., “LA + Seattle Trip”) |
| `notes` | `text` | Optional user notes |
| `created_at` | `timestamp` | Default `now()` |
| `updated_at` | `timestamp` | Default `now()` on update |

### Row Level Security (RLS)
```sql
ALTER TABLE travel_plan_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved trips"
ON travel_plan_saved
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved trips"
ON travel_plan_saved
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved trips"
ON travel_plan_saved
FOR DELETE USING (auth.uid() = user_id);
```

---

## 🧠 API Endpoints

Base path: `/api/travel-plans`

| Method | Endpoint | Purpose | Auth Required |
|---------|-----------|----------|----------------|
| `POST` | `/api/travel-plans` | Save new itinerary | ✅ |
| `GET` | `/api/travel-plans` | Fetch all saved itineraries for user | ✅ |
| `DELETE` | `/api/travel-plans/[id]` | Delete itinerary | ✅ |

### Example: POST `/api/travel-plans`
```typescript
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  const { user_id, trip_input, itinerary, title, notes } = await req.json()

  const { data, error } = await supabase
    .from('travel_plan_saved')
    .insert([{ user_id, trip_input, itinerary, title, notes }])

  if (error) return new Response(JSON.stringify({ error }), { status: 400 })
  return new Response(JSON.stringify(data), { status: 201 })
}
```

---

## 💻 Frontend Changes

### 1. Trip Builder Page
- **Add “Save Itinerary” button** (visible after generation).
- On click:
  - Verify user is authenticated.
  - POST selected itinerary and input data to `/api/travel-plans`.
  - Show success toast (“Trip saved to your account”).
  - Disable button briefly to prevent duplicate saves.

### 2. Account Page
- **New Section:** “Saved Itineraries”
  - Fetch from `/api/travel-plans`.
  - Display:
    - Title (editable inline)
    - Cities / main stops summary
    - Created date
    - Action buttons: `View`, `Rename`, `Delete`
  - If empty: show placeholder text “No saved itineraries yet.”

---

## 🧪 QA & Testing

| Test Case | Expected Result |
|------------|----------------|
| Save itinerary while logged in | Record created successfully, visible under account |
| Save itinerary while logged out | Prompt login modal |
| Delete itinerary | Record removed and UI refreshed |
| Duplicate save | Optional dedupe logic (same trip_input ignored) |
| Rename itinerary | Updates title field only |
| View itinerary | Navigates back to Trip Builder with JSON loaded |

---

## 🧱 Future Enhancements (v2+)
- **Re-load itinerary into Trip Builder** to edit or re-generate.  
- **Version history** (retain previous saves).  
- **Auto-save** most recent itinerary per user.  
- **Export to PDF or shareable link.**  
- **Tiered access:** Free users limited to 3 saves.

---

## ⏱️ Time & Responsibility Breakdown

| Task | Role | Est. Hours |
|-------|------|------------|
| Supabase schema + RLS | Backend Dev | 1.5 |
| API route setup (POST/GET/DELETE) | Backend Dev | 2 |
| Trip Builder save UI + integration | Frontend Dev | 2 |
| Account page section (list + delete) | Frontend Dev | 2 |
| QA & review | PM / Dev | 0.5 |

**Total:** ~8 hours (1 day)

---

## ✅ Deliverables
- `travel_plan_saved` table created and tested  
- `/api/travel-plans` routes deployed and working  
- “Save Itinerary” button functional in Trip Builder  
- “Saved Itineraries” list displayed on Account page  
- QA passed on auth, save/delete, and UI states

---

## 🚀 Next Steps
1. Confirm schema migration in Supabase dashboard.  
2. Add new API route folder in `/app/api/travel-plans`.  
3. Merge to staging branch → test auth flow.  
4. Re-enable Save button in Trip Builder.  
5. Deploy to production after QA sign-off.

---

**End of Document**
