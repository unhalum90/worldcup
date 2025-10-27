# 🏗️ World Cup Fan Zone — Planner QA + Theming Implementation (v1.0)
**Date:** October 26, 2025  
**Author:** Eric Chamberlin  
**Purpose:** Consolidated feedback and next-phase enhancement plan for:
- Lodging Planner UI/UX refinement
- Flight Planner data/output validation
- Team-color personalization system (using `user_profile.favorite_team`)

---

## 🏨 Lodging Planner — UX & Content Review

### ✅ What’s Working
- Excellent logical flow: **Selected Itinerary → Tune Planner → Plan Ready → Zone Comparisons → Insights/Guidance**
- Data density is balanced — good mix of numeric, narrative, and visual info.
- Tone is professional but friendly; “Why it Wins / Trade-offs” framing is strong.
- Personalized data (family size, nights, preferences) feels authentic.
- “Match Score” system works emotionally — people *feel* rewarded by high %.

### ⚙️ What Needs Improvement
1. **Visual Flow & Separation**
   - Background tones between sections are too similar.
   - Add alternating neutral (#fafafa / #fff) for clarity.

2. **Match Score Repetition**
   - Top card repeats in Zone Comparisons. Collapse duplicate; show “See All Zones” button.

3. **Heat Map**
   - Improve label contrast on dark background.
   - Add “Tap to Expand” interaction for mobile.

4. **Slider Labels**
   - Replace percentages with qualitative cues:
     - Stadium proximity → “Short ride” / “Moderate distance”
     - Local culture → “Immersive” / “Touristy”

5. **Insights vs Booking Guidance**
   - Use distinct background colors or icons for each block.
   - Increase vertical padding for readability.

6. **Add Microanimation**
   - Show small progress/loading animation when recalculating lodging matches.

7. **Future Enhancements**
   - “Save as PDF / Share Plan” button near result header.
   - Integrate favorite team color theme (see below).

---

## ✈️ Flight Planner — QA & Data Validation

### ✅ Strengths
- 3-column comparison (Smartest / Budget / Fastest) is intuitive.
- Price bands and airline examples feel realistic.
- Tone is consistent with Lodging Planner — professional, contextual, urgent.
- Real-world detail: 250th anniversary note, booking deadlines, and ground plans.
- Clear calls to action ("Export this option") ready for activation.

### ⚙️ Refinement Points
1. **Differentiate Smartest vs Fastest**
   - Currently both use AMS → PHL with similar times.
   - Make “Fastest” feature nonstop or ultra-short layover (e.g., via FRA).
   - Adjust durations and fares to show meaningful variance.

2. **Budget Option Simplification**
   - Summarize ground plans as one-line metrics:
     - EWR → 2 hrs / ~$40 via NJ Transit
     - BWI → 1.5 hrs / ~$60 via Amtrak

3. **Reduce Repeated Ground Details**
   - Move SEPTA guidance into a single shared section at bottom.

4. **Pricing Spread**
   - Increase separation for perceived decision value:
     - Budget: $1600–$2100  
     - Smartest: $1900–$2500  
     - Fastest: $2500–$3200

5. **Reminders Section**
   - Combine packing, visa, and match day under “Travel Prep.”
   - Add:
     > **Insurance:** Consider coverage for flight delays due to tournament congestion.

6. **Add Optional Fields**
   - Typical connection city (e.g., FRA, JFK)
   - Layover reliability note (avoid ORD)
   - Baggage or family tip (e.g., Delta free car seat check)

7. **Icons**
   - Smartest 💡 / Budget 💰 / Fastest ⚡ improve visual recognition.

---

## 🎨 Team-Color Personalization System

### 🎯 Goal
Personalize the user experience across all planners and exports by dynamically applying each fan’s favorite team colors, pulled from onboarding (`user_profile.favorite_team`).

### 🧩 Implementation Plan

#### 1. Palette Map
Create `/lib/constants/teamColors.ts`:

```ts
export const teamColors = {
  Netherlands: { primary: "#FF4B17", secondary: "#002F6C" },
  France: { primary: "#0055A4", secondary: "#EF4135" },
  Brazil: { primary: "#FEDD00", secondary: "#009739" },
  Argentina: { primary: "#75AADB", secondary: "#FFFFFF" },
  England: { primary: "#FFFFFF", secondary: "#C8102E" },
  Spain: { primary: "#AA151B", secondary: "#F1BF00" },
  Germany: { primary: "#000000", secondary: "#DD0000" },
  Portugal: { primary: "#006600", secondary: "#FF0000" },
  Italy: { primary: "#007FFF", secondary: "#FFFFFF" },
  USA: { primary: "#002868", secondary: "#BF0A30" },
  Mexico: { primary: "#006847", secondary: "#CE1126" },
  Canada: { primary: "#FF0000", secondary: "#FFFFFF" },
  Uruguay: { primary: "#1EB4E8", secondary: "#FFD700" },
  Japan: { primary: "#002654", secondary: "#FFFFFF" },
  South_Korea: { primary: "#C60C30", secondary: "#003478" },
  Australia: { primary: "#FFCD00", secondary: "#00843D" },
  Morocco: { primary: "#C1272D", secondary: "#006233" },
  Senegal: { primary: "#00853F", secondary: "#E31B23" },
  Nigeria: { primary: "#008751", secondary: "#FFFFFF" },
  Croatia: { primary: "#171796", secondary: "#FF0000" },
  Switzerland: { primary: "#DA291C", secondary: "#FFFFFF" },
  Belgium: { primary: "#000000", secondary: "#FFD700" },
  Poland: { primary: "#DC143C", secondary: "#FFFFFF" },
  Ecuador: { primary: "#FFD100", secondary: "#0033A0" },
  Colombia: { primary: "#FCD116", secondary: "#003893" },
  Saudi_Arabia: { primary: "#006C35", secondary: "#FFFFFF" },
  Iran: { primary: "#239F40", secondary: "#DA0000" },
  Qatar: { primary: "#8A1538", secondary: "#FFFFFF" }
};
```

---

#### 2. Theming Hook
In `/hooks/useTeamTheme.ts`:

```ts
import { teamColors } from "@/lib/constants/teamColors";

export function useTeamTheme(favoriteTeam?: string) {
  const colors = favoriteTeam ? teamColors[favoriteTeam] : null;

  if (colors) {
    document.documentElement.style.setProperty("--primary-color", colors.primary);
    document.documentElement.style.setProperty("--secondary-color", colors.secondary);
  } else {
    document.documentElement.style.setProperty("--primary-color", "#E50914");
    document.documentElement.style.setProperty("--secondary-color", "#111");
  }
}
```

---

#### 3. Apply Theme on Profile Load
In `layout.tsx` or wherever profile hydration occurs:

```ts
const { favorite_team } = userProfile || {};
useEffect(() => {
  useTeamTheme(favorite_team);
}, [favorite_team]);
```

---

#### 4. Update CSS Variables
In `globals.css`:

```css
:root {
  --primary-color: #E50914;
  --secondary-color: #111;
}

.btn-primary {
  background-color: var(--primary-color);
}

.gradient-hero {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}
```

---

#### 5. Future Extensions
- **PDF exports:** Use theme colors in headers/borders.  
- **Emails:** Include favorite team accent line in headers.  
- **Team Pages:** Already color-aware; unify system so planners and team pages share the same palette source.

---

## 🚀 Summary of Next Steps

| Priority | Task | Owner | Status |
|-----------|------|--------|--------|
| Critical | Adjust Lodging section separation, slider labels | Frontend | Pending QA |
| High | Differentiate Smartest vs Fastest in Flight Planner | Content + Dev | Pending |
| High | Simplify ground plan copy and price spread | Content | Pending |
| Medium | Implement `useTeamTheme` and color map | Frontend | Ready for build |
| Medium | Add export button placeholders | UI | Planned |
| Low | Add microanimation on planner calculations | UI | Optional |

---

**Outcome:**  
Once these refinements and theming enhancements are in place, both planners will feel personalized, professional, and emotionally engaging — ready for pre–Draw Day rollout and strong retention on launch.
