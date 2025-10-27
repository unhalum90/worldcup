# ✈️ Planner Loader System (v1.0)
### With Icons + Text Animation

---
DO NOT CHANGE THE LAODING SEQUENCE FOR TRIP BUILDER, this is ONLY FOR FLIGHTS AND LODGING

## 🎯 Concept Overview

Each planner includes:
- A short **progress simulation (~60 seconds)**  
- A **rotating text sequence** derived from the user’s trip data  
- **Dynamic icons** that align with each message  
- A **nonlinear progress bar** that gives the illusion of “AI processing”  
- Fully local execution — no API or backend dependencies

---

## 🧩 Flight Planner Loader

### 💬 Message Sequence (with Icons)

| Icon | Message Example | Behavior |
|------|------------------|-----------|
| ✈️ | Scanning flights from **Amsterdam → Philadelphia**... | Plane glides across line |
| 🕒 | Checking layovers under 2 hours... | Clock pulses gently |
| 💺 | Comparing seat options for **4 travelers**... | Seat icon slides in |
| 🧳 | Estimating total travel time and baggage cost... | Luggage wiggles slightly |
| 🌍 | Evaluating alternate hubs: EWR · BWI · IAD | Globe rotates |
| 🧠 | Matching **Smartest**, **Budget**, and **Fastest** routes... | Brain icon pulses |
| 🏁 | Finalizing best itinerary suggestions... | Flag waves (Lottie optional) |

**Implementation Snippet:**

```tsx
<motion.div
  key={index}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.5 }}
>
  <span className="text-2xl mr-2">{icons[index]}</span>
  <span>{messages[index]}</span>
</motion.div>
```

---

### 📊 Progress Bar Simulation

| Phase | Range | Speed |
|-------|--------|-------|
| Initial scan | 0–70% | Fast |
| Analysis | 70–90% | Medium |
| Optimization | 90–97% | Slow crawl |
| Completion | N/A | Waits for async data |

Color: `--flight-primary (#0EA5E9)`  
Optional shimmer: animated gradient left → right.

---

### ✈️ Visual Enhancements
- Optional **Lottie animation** of a plane following a dotted arc path.  
- CSS alternative: SVG `<path>` with keyframe animation (`stroke-dasharray` effect).  
- Background gradient: soft sky hues (`#E0F2FE → #F0F9FF`).

---

## 🏨 Lodging Planner Loader

### 💬 Message Sequence (with Icons)

| Icon | Message Example | Behavior |
|------|------------------|-----------|
| 🏙️ | Mapping top-rated neighborhoods in **Philadelphia**... | Map pins drop in |
| 🚇 | Checking commute time to stadium and Fan Fest... | Train slides left to right |
| 👨‍👩‍👧 | Prioritizing **family-friendly** options... | Family icon fades in |
| 🍽️ | Balancing nightlife and dining options nearby... | Fork & knife pulse |
| 🏛️ | Exploring cultural highlights near your zone... | Museum icon appears |
| 🏠 | Comparing **11-night stay** under $225/night... | House icon wiggles |
| 🛏️ | Finding quiet stays for your “Family Trip” preference... | Bed icon slides in |
| 📍 | Finalizing lodging zones and travel scores... | Location pin drops |

Color: Coral (`--lodging-primary #F87171`)  
Optional visual: Lottie “map pin bounce” or CSS heatmap pulse.

---

### 📊 Progress Bar
Same pacing logic as flight planner.

Gradient: `#F87171 → #DC2626`  
Animated pulse effect when nearing completion.

---

## ⚙️ Technical Implementation Summary

### Core Component
**`/components/PlannerLoader.tsx`**

**Props:**
```ts
{
  plannerType: "flight" | "lodging";
  trip: { from?: string; to?: string; city?: string; startDate: string; endDate: string; travelers: number; };
}
```

**Icons:**
```tsx
import { Plane, Bed, Clock, MapPin, Globe2, Users, Brain, Luggage } from "lucide-react";
```

**Dynamic message arrays** per planner type.  
Use Framer Motion for message transitions + progress animation.

---

### Simulated Progress Hook

```ts
function useSimulatedProgress(duration = 60000) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(97, (elapsed / duration) * 100 * (elapsed < duration * 0.8 ? 1.5 : 1));
      setProgress(pct);
    }, 150);
    return () => clearInterval(timer);
  }, [duration]);

  return progress;
}
```

---

### Integration Example

```tsx
<PlannerLoader plannerType="flight" trip={tripData} />
```

Display loader until response is returned; fade in planner output when ready.

---

## 🧠 Optional Enhancements

- **Team Flag Pulse:** Pulse the user’s favorite team flag in navbar during load.  
- **Soccer Ball Easter Egg:** Tiny soccer ball bouncing along the progress bar (CSS animation).  
- **Travel Fact Overlay:** Insert a random fact every few lines (from local JSON).  
- **Audio Option:** Short crowd ambience or plane sound, muted by default.

---

## 🚀 UX Benefits

| Feature | Benefit |
|----------|----------|
| Text + Icons | Reduces perceived wait time |
| Real trip details | Feels personalized |
| Dynamic pacing | Adds intelligence realism |
| Local animation only | Zero performance cost |
| Optional flag or facts | Adds fan excitement |

---

**Outcome:**  
The loader system turns a necessary waiting period into an engaging, context-rich moment that reinforces brand trust and user anticipation.
