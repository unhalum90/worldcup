# 🌍 World Cup 2026 Fan Zone App — Project Overview

## 🎯 Goal
Build a **fan-first, location-based travel and community platform** for the 2026 FIFA World Cup in North America.  
The app will provide city-specific guides, community forums, personalized travel planning, and consistent branded media content, while maintaining official tournament basics (match schedules, times, and key info).

---

## ⚽️ Core Features Summary

### 1️⃣ Location-Specific Forums (Community Layer)
- **Purpose:** City-specific hubs for fans visiting each host city.  
- **Free Access (until April 2025):** Allows early adoption and engagement.  
- **Transition to Paid (April 2025):** Forums move behind a subscription paywall.  
- **Functions:**  
  - Fan tips, meetups, and Q&A threads per city.  
  - Upvote/downvote system for most useful info.  
  - Verified moderators for quality control.  

**Tech:** Airtable + Supabase (initial MVP), full forum migration later to custom backend.

---

### 2️⃣ AI Travel Planner (Premium Feature)
- **Goal:** Generate personalized itineraries for fans visiting North America for the World Cup.  
- **User Inputs:** Group size, budget, travel style, match tickets, accessibility needs.  
- **AI Output:** Morning/afternoon/evening itinerary + transport tips + local food recs.  
- **Integration:** Built via Make.com + OpenAI → outputs stored in Airtable and served in app.

---

### 3️⃣ Multilingual Experience
- Supported languages: **English, French, Spanish, Portuguese, Arabic.**  
- Target coverage: 90%+ of expected fan base.  
- Additional users (e.g., Netherlands, Scandinavia, Germany) default to English or use built-in auto-translate.  
- YouTube and app-level AI translations supported for all videos.

---

### 4️⃣ Consistent AI Video Guides
- **Tool:** HeyGen (AI-generated likeness for consistency).  
- **Focus:** Stadium previews, fan logistics, transport, safety, and top attractions.  
- **Style:** Branded background music + cutaways to b-roll of cities/stadiums.  
- **Benefit:** Consistent, on-brand messaging with scalable production.  
- **Hybrid Option:** Mix of AI and human video content for key cities.

---

### 5️⃣ Early Access & Subscription Model
- **Free Phase:** Forums open to all users through early 2025.  
- **Presale Launch (March 2025):** Discounted subscription to retain forum access + unlock AI planner.  
- **Full Paywall (April 2025):** Forums and AI planner become premium-only.  
- **Price Range:** $29–$49 (lifetime or tournament pass).  

---

## 📅 Tournament Basics — Mandatory Information Coverage

### 📆 Key Dates
| Phase | Dates | Notes |
|--------|-------|-------|
| Opening Match | **June 11, 2026** | Likely in Mexico City |
| Group Stage | **June 11 – July 3, 2026** | 48 teams, 16 groups of 3 |
| Round of 32 | **July 4 – 7, 2026** | Single elimination begins |
| Round of 16 | **July 8 – 11, 2026** | |
| Quarterfinals | **July 12 – 15, 2026** | |
| Semifinals | **July 16 – 17, 2026** | |
| Final | **July 19, 2026** | Expected at MetLife Stadium (New Jersey) |

### 🏟️ Host Cities (Confirmed)
**United States (11):** Atlanta, Boston, Dallas, Houston, Kansas City, Los Angeles, Miami, New York/New Jersey, Philadelphia, San Francisco Bay Area, Seattle.  
**Canada (2):** Toronto, Vancouver.  
**Mexico (3):** Guadalajara, Monterrey, Mexico City.

### ⏰ Match Times
- Local match times will vary by venue timezone (Eastern, Central, Pacific, Mountain).  
- Average kickoff times expected: **1 PM, 4 PM, and 7 PM local time**.  
- The app will automatically adjust to local user timezone (browser/device sync).

### 🎫 Tickets & Official Info
- **Official ticketing:** `https://www.fifa.com/tickets`
- **Fan ID & Entry Requirements:** Visa waivers and travel regulations to be added per country in app.  
- **Official match schedule PDF:** To be embedded and downloadable from FIFA once finalized (expected 2025 Q2).

---

## 🔧 Build Phases & Roadmap

| Phase | Timeline | Focus |
|-------|-----------|--------|
| **MVP Website** | Oct–Dec 2024 | Landing page, waitlist, RSS news feed integration |
| **App MVP (Forums + City Guides)** | Jan–Apr 2025 | Forums live, Airtable backend, news feed automation |
| **AI Travel Planner** | Mar–Apr 2025 | Launch premium AI itinerary builder |
| **Video Layer** | Apr–Jun 2025 | Deploy AI video guides per city |
| **Monetization + Paywall** | Apr–May 2025 | Convert free → paid forum users |
| **Tournament Launch Prep** | Jun 2025 – May 2026 | Final UI, match schedule, sponsor onboarding |
| **Live Tournament Coverage** | Jun–Jul 2026 | Real-time updates, community engagement |
| **Post-Cup Transition** | Aug 2026 | Archive, analytics, pivot to LA28/Euro28 Fan Zones |

---

## 📊 Monetization & Growth
| Channel | Description | Timing |
|----------|-------------|---------|
| **Subscriptions** | $29–49 for premium access | March 2025 |
| **Affiliate Revenue** | Booking.com, GetYourGuide, parking apps | Launch |
| **Ad Sales** | Stadium-city local ads (restaurants, hotels) | Q2 2025 |
| **Cross-Promotion** | LA28 / Euro28 Fan Zones | Post-WC26 |

---

## 🧠 Key Integrations

| Area | Tool | Role |
|------|------|------|
| **Automation** | Make.com | RSS → AI → Airtable pipeline |
| **Database** | Airtable / Supabase | Store city data, news, itineraries |
| **AI Summaries** | OpenAI / Make AI | Summaries, tags, travel suggestions |
| **CMS** | Next.js / Vercel | Website hosting + app frontend |
| **Video** | HeyGen / Pictory / CapCut | AI guides + multilingual dubbing |
| **Payments** | Stripe | Subscription management |

---

## 🌎 Future Expansion — Beyond WC26
- **Euro 2028 Fan Zone (UK/Ireland):** replicate model for European audience.  
- **LA28 Olympic Fan Zone:** US relaunch in late 2027.  
- **Rugby/Cricket Worlds:** test smaller events as pre-2028 engagement boosters.

---

**Prepared by:** Eric Chamberlin  
**Date:** October 6, 2025  
**Document Type:** Development & Strategy Brief  
