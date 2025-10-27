# 🌍 World Cup Fan Zone — User Profile & Onboarding Specification
**Version:** 1.0  
**Last Updated:** Oct 25, 2025  
**Author:** Eric Chamberlin / Fan Zone Network

---

## 🎯 Purpose

To unify data collection across all AI planners (Trip Builder, Flight Planner, Lodging Planner, and others) by establishing a **persistent user profile** captured once during onboarding.  
This ensures:
- Consistent personalization across tools  
- Less friction for users (no repeated forms)  
- Centralized analytics and segmentation  
- Future extensibility for premium or group features  

---

## 🧩 Architecture Overview

Each authenticated user has:
1. **`user_profile`** — persistent traveler data (stable over time)  
2. **`trip_plans`** — situational data per trip  
3. **`user_preferences`** (optional extension) — for future enhancements such as notifications or newsletter opt-ins  

All planners read from the `user_profile` first and merge it with current `trip_plan` context to generate AI travel reports.

---

## 🗃️ Database Schema (Supabase)

### Table: `user_profile`
Stores the traveler’s core identity and recurring preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK → auth.users.id) | Linked to Supabase Auth |
| `home_city` | TEXT | Default city or town of origin |
| `home_airport` | JSONB (IATA code, name, lat/lon) | Default airport |
| `group_size` | INT | Number of people normally traveling |
| `children` | INT | Children count |
| `seniors` | INT | Seniors count |
| `mobility_issues` | BOOLEAN | Accessibility flag |
| `budget_level` | ENUM('budget','moderate','premium') | Base spending category |
| `comfort_preference` | ENUM('budget_friendly','balanced','luxury_focus') | Travel comfort level |
| `food_preference` | ENUM('local_flavors','international','mix') | Dining focus |
| `nightlife_preference` | ENUM('quiet','social','party') | Social activity style |
| `climate_preference` | ENUM('avoid_heat','open_to_hot','prefer_warm') | Weather tolerance |
| `travel_focus` | TEXT[] | ['fanfest','local_culture','stadium_experience','nightlife'] |
| `preferred_transport` | ENUM('public','car','mixed') | Usual transportation style |
| `languages` | TEXT[] | Spoken languages |
| `currency` | TEXT | Default currency (e.g. 'USD','EUR') |
| `favorite_team` | TEXT | Optional |
| `created_at` | TIMESTAMP | Default now() |
| `updated_at` | TIMESTAMP | Auto-update trigger |

---

### Table: `trip_plans`
Stores temporary trip-specific context.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK → auth.users.id) | Linked to profile |
| `cities_visiting` | TEXT[] | Selected host cities |
| `start_date` | DATE | Trip start |
| `end_date` | DATE | Trip end |
| `has_match_tickets` | BOOLEAN | True if tickets purchased |
| `match_dates` | TEXT[] | ISO dates |
| `ticket_cities` | TEXT[] | Cities tied to tickets |
| `personal_context` | TEXT | Freeform notes |
| `surprise_me` | BOOLEAN | Optional |
| `created_at` | TIMESTAMP | Default now() |
| `updated_at` | TIMESTAMP | Auto-update trigger |

---

## 🧠 AI Context Merge Logic

When generating any travel report (Trip / Flight / Lodging):

```ts
const context = {
  ...userProfile,
  ...tripPlan, // overrides if same field
};
```

This ensures AI prompts include both persistent persona and current itinerary.

---

## 🧭 Onboarding Flow (3 Steps, 45 Seconds)

### Step 1 – Traveler Basics
- Home city (autocomplete)
- Default airport (select by IATA)
- Group size, children, seniors, mobility

### Step 2 – Travel Style
- Budget level
- Comfort, food, nightlife, and climate preferences

### Step 3 – Interests
- Primary travel focus (FanFest, culture, stadium, nightlife)
- Preferred transport mode
- Favorite team (optional)

✅ **Final Screen:**  
> “You’re all set! We’ll personalize every trip and planner to match your profile. You can update this anytime in your settings.”

---

## 🧩 Integration Points

- **Trip Builder:** auto-populate traveler info & preferences; user only chooses destination and dates.  
- **Flight Planner:** defaults to `home_airport`; use budget level + comfort preference to rank flight options.  
- **Lodging Planner:** weight scoring by comfort, budget, nightlife, and mobility settings.  
- **PDF Reports:** dynamically inject phrasing (“As a moderate-budget traveler focused on local culture…”)  

---

## 🔒 Security & Privacy

- Enable **RLS (Row Level Security)** on `user_profile` and `trip_plans`.  
- Allow users to view/update only their own records.  
- Add clear consent text during onboarding:  
  > “Your data is used only to personalize your travel recommendations. You can delete it anytime.”

---

## 🔮 Future Extensions

| Feature | Description |
|----------|--------------|
| **Multi-Traveler Profiles** | Add household/group support |
| **Sync with Google Flights** | Autofill home airport / destination tracking |
| **Notification Preferences** | Email / SMS for ticket updates |
| **AI Re-Evaluation** | Periodic prompt: “Your profile is 90 days old — refresh?” |

---

## ✅ Implementation Checklist

- [ ] Create `user_profile` table in Supabase  
- [ ] Create `trip_plans` table (if not already live)  
- [ ] Build onboarding UI (3 steps + progress indicator)  
- [ ] Add profile confirmation modal before each planner session  
- [ ] Update all planners to fetch `user_profile` on load  
- [ ] Integrate context merge in AI calls  
- [ ] Add “Edit Profile” route under `/account/profile`  

---

## 📈 Outcome

- Unified personalization across all planning tools  
- Reusable schema for scaling to other tournaments (Copa América, Olympics)  
- Higher user satisfaction and retention  
- Simplified marketing segmentation by traveler type  

---

**End of Spec**
