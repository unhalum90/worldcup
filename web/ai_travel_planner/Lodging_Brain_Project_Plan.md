

---

# 🧱 Updated Build Plan – World Cup Travel Brain (October 2025)

## 🏁 Rebranding & Core Experience

### New Main Feature Name
**World Cup Trip Travel Overview**  
> “Plan your complete World Cup journey — flights, lodging, and logistics in one simple view.”

**Alternate Phrases for A/B Testing:**
1. **World Cup Journey Planner**
2. **Follow Your Team — Smart Travel Plan**
3. **Ultimate Fan Trip Builder**

### Landing Page Layout (Revised)
```
------------------------------------------------------
🌎 World Cup 2026 AI Travel Planner
------------------------------------------------------

🎯 World Cup Trip Travel Overview
→ Get your personalized trip overview in 30 seconds.

[Start My Trip Overview]

------------------------------------------------------
Or explore one module at a time:
------------------------------------------------------

✈️ Flight Brain     |   🏨 Lodging Brain     |   ⚽ Local Brain
[Open Flight Brain]   [Open Lodging Brain]    [Coming May 2026]
------------------------------------------------------
```

---

## 🧩 Modular App Structure

### ✈️ Flight Brain
- Live routing between host cities (flights, trains, car) via Gemini + Google Travel connectors.  
- Recognizes transit hubs like **Chicago**, **Dallas**, and **Atlanta**.  
- Can suggest non‑host city travel routes (e.g., *Chicago → Kansas City by train* if cheaper or simpler).  
- Generates route summaries, times, and cost bands.

### 🏨 Lodging Brain
- Reuses Supabase `zones` + `transport_routes`.  
- Focuses on spatial reasoning: proximity, commute times, fan‑friendliness.  
- Gemini Directions API used for commute accuracy.  
- GPT summarizes recommendations in user’s chosen language.

### ⚽ Local Brain (May 2026 Launch)
- Real‑time city info: fan fests, transit, stadium access, local safety, restaurants.  
- Pulls from manual and crowd‑verified datasets.

---

## 🗓️ Game Data Integration

### New Table: `matches`

| Field | Type | Example | Notes |
|--------|------|----------|-------|
| id | uuid | — | PK |
| date | date | 2026-06-11 | |
| city_id | uuid | — | FK to `cities` |
| stadium_name | text | AT&T Stadium | |
| group_name | text | Group F | |
| match_number | integer | 11 | |
| home_team | text | Norway | updatable |
| away_team | text | Argentina | updatable |
| kickoff_local | time | 20:00 | |
| notes | text | Opening match in Arlington | |

### Functionality
- Fans can choose **team name** → app retrieves all match cities/dates.  
- **Flight Brain** auto‑builds route in chronological order.  
- **Lodging Brain** aligns stay durations with those match dates.  
- **Local Brain** shows relevant city activities and fan zones on those days.

---

## 🧭 Data‑Driven Travel Logic

### Example: Chicago as Strategic Hub
- Chicago = major international hub, no WC games.  
- The planner can still route *Oslo → Chicago → Kansas City* and show:
  > “Take direct flight to Chicago, then 7‑hour Amtrak to Kansas City — saves 2 h and $180 pp compared to connecting flights.”
- These “smart hops” become signature recommendations.

### Implementation
- Add `is_hub` flag in `cities` table for Chicago, Dallas, Atlanta, NYC, etc.  
- Gemini checks for hub options when calculating multi‑city routes.

---

## 📅 Updated Timeline

| Phase | Window | Focus | Deliverables |
|--------|---------|--------|--------------|
| **Now – Dec 4 2025** | Pre‑Draw | Build & launch **World Cup Trip Travel Overview** MVP | Unified form → Gemini + GPT output |
| **Dec 5 2025** | Draw Day | Public beta launch | Live “team‑aware” routing using `matches` table |
| **Dec – Jan 2026** | | Deploy Flight Brain & Lodging Brain as modules | Separate pages, shared schema |
| **Feb – Apr 2026** | | Localization rollout (ES, FR, PT) & hub routing improvements | SEO pages + multilingual UI |
| **May 2026** | | Launch Local Brain | Fan Fest & local data |
| **Jun – Jul 2026** | | Tournament live mode | Daily updates, crowd inputs |

---

## 🧠 Architecture Snapshot (Hybrid AI)

```
User Input → Supabase (cities, zones, matches)
             ↓
Gemini (Flights, Transit, Hubs, Directions)
             ↓
GPT‑5 (Narrative generation, localization)
             ↓
Frontend Output (Overview / Flight / Lodging / Local)
```

**Gemini = Data + Reasoning Layer**  
**GPT = Storytelling + Localization Layer**

---

## ✅ Summary of Enhancements

- Clear naming hierarchy: *World Cup Trip Travel Overview* + 3 Brains.  
- New `matches` dataset = live team‑based routing after Dec 5.  
- Added city‑hub intelligence (e.g., Chicago → KC train option).  
- Fully localized, modular build path tied to real 2026 timeline.  
- December MVP delivers instant value; May expansion completes full fan journey.

