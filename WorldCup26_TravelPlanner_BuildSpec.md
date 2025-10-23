# 🌍 World Cup 2026 Travel Planner – Build Specification  
**Page Route:** `/planner`  
**Parent Nav Title:** `Travel Planner`  
**Purpose:** Core utility page for users to plan and manage their trip across 2026 World Cup host cities — from initial itinerary to in-city logistics.  

---

## 🧭 PAGE OVERVIEW

**Goal:**  
Provide a single hub where fans can plan every stage of their World Cup journey — before, during, and after travel.

**Core Concept:**  
> “Wherever you are in your World Cup experience — we’ve got you covered.”

**Tone:**  
Friendly, reliable, travel-first.  
AI is present but **subtle** — focus on usefulness and simplicity.

---

## 🧱 PAGE STRUCTURE

### 1️⃣ **Hero Section**
**Purpose:** Introduce the planner’s value proposition clearly.

**Layout:**
- Full-width hero banner with subtle stadium/city background (blurred for readability).
- Center-aligned heading + subheading.
- “Start Planning” primary CTA.

**Copy:**
```text
# Plan Every Step of Your World Cup Journey  
From booking your first flight to finding fan fests on match day — we’ve got you covered, city by city.  

[Start Planning] (CTA Button → scrolls to Phase Grid)
```

**Optional Subtext (under CTA):**
> *Powered by smart AI — so your trip plans itself.*

---

### 2️⃣ **Intro Text Block**
**Purpose:** Short explanation before showing the 4 sections.

**Copy:**
> The **Fan Zone Travel Planner** brings everything together — your matches, flights, stays, and on-the-ground experiences — into one easy place to explore.  
> Whether you’re following your team across borders or soaking up one host city’s atmosphere, this is your home base for travel planning.

---

### 3️⃣ **Four-Phase Grid**
**Purpose:** Summarize the four main planning phases (each a card or tile linking to its dedicated section).  

**Layout:**
- Responsive 2x2 grid (desktop) / stacked (mobile)
- Each card includes:  
  - Emoji/Icon  
  - Title  
  - One-sentence description  
  - CTA button (“Open” or “Explore”)  

---

#### 🗺️ **1. Trip Builder (Overview Replacement)**  
**Slug:** `/planner/trip-builder`  

**Purpose:** Entry point for itinerary and match overview.  
**Status:** Live.  

**Copy:**  
> **Trip Builder**  
> Map your route and see where your team plays — connect cities, matches, and dates into one simple plan.  
> [Open Trip Builder]  

**Features:**  
- AI-assisted route suggestions based on selected team.  
- Distance/time estimates between host cities.  
- Exportable itinerary (PDF or share link).  
- Upcoming matches preview (by group or team).  

**Design Notes:**  
- Include a world map or simplified USA/Canada/Mexico route map.  
- Optional “Add to My Plan” button on each match.  

---

#### ✈️ **2. Getting There (Flights)**  
**Slug:** `/planner/flights`  

**Purpose:** Compare flight routes between host cities.  
**Status:** Live.  

**Copy:**  
> **Getting There**  
> Find the fastest and most affordable ways to hop between World Cup cities — flight suggestions, routes, and smart timing insights.  
> [Explore Flights]  

**Features:**  
- Integrate Skyscanner or Google Flights deep links (no direct booking).  
- Suggest “hub” airports for fans following teams.  
- AI-generated note: “If your team advances, consider booking flexible fares.”  

**Design Notes:**  
- Simple city-to-city dropdowns (origin/destination).  
- Card-style flight summaries with prices/durations.  
- Optional AI tip tooltip (⚡ icon for AI recommendation).  

---

#### 🏨 **3. Staying There (Lodging)**  
**Slug:** `/planner/lodging`  

**Purpose:** Help users find accommodation close to stadiums and fan areas.  
**Status:** Live.  

**Copy:**  
> **Staying There**  
> Hand-picked hotels, hostels, and neighborhoods — all near stadiums and fan celebrations.  
> [Find Lodging]  

**Features:**  
- Booking.com / Expedia deep links by city.  
- Stadium radius filters (within 3km, 5km, 10km).  
- “Fan Zone Recommends” tags (manually curated).  

**Design Notes:**  
- Thumbnail images per listing (stadium or neighborhood).  
- Optional “Add to My Plan” to save favorite stays.  
- Tooltip: “⚡ AI suggests nearby areas based on your match times.”  

---

#### 🎉 **4. While You’re There (On the Ground)**  
**Slug:** `/planner/on-the-ground`  
**Purpose:** Fan experience tools — transport, fan fests, local events.  
**Status:** *Coming May 2026.*  

**Copy:**  
> **While You’re There**  
> From fan fests to public transport, discover everything you need once you’ve arrived.  
> [Coming Soon – May 2026]  

**Features (Future):**  
- Local transport links (metro, rideshare, stadium shuttles).  
- Fan fest locations & schedules.  
- Safety + cultural tips per city.  
- Nightlife & watch-party listings.  

**Design Notes:**  
- Keep card visible now with “Coming Soon” ribbon or overlay.  
- Enable notifications/email signup for “Notify Me When Live.”

---

### 4️⃣ **Summary / Footer CTA**

**Purpose:** Encourage ongoing engagement and funnel users toward the newsletter + city guides.

**Copy:**
> Wherever your team takes you — the **Fan Zone Travel Planner** has your trip covered from kickoff to the final whistle.  
> Get updates, new features, and fresh travel insights straight to your inbox.  

**CTA Buttons:**  
- [Subscribe to Fan Zone Insider] (Beehiiv link)  
- [Download Free Dallas Guide] (LemonSqueezy placeholder link)  

---

## ⚙️ TECHNICAL / DESIGN NOTES

### Framework
- **Tech:** Next.js 15 (App Router) + Supabase + Tailwind  
- **Component Reuse:** Cards and CTA buttons from `ui/components/cards` and `ui/components/buttons`
- **Responsive Design:**  
  - 2x2 grid on desktop  
  - single column on mobile  
  - hero CTA centered vertically  

### Supabase Integration
- Data sources:
  - `teams` (for Trip Builder)  
  - `venues` (for Flights + Lodging)  
  - `guides` (for contextual city PDFs)
- Add relational link between `planner_phases` and `cities` for modular updates.  

### Analytics
- Add tracking IDs for each phase click event:
  - `planner_tripbuilder_click`
  - `planner_flights_click`
  - `planner_lodging_click`
  - `planner_ontheground_click`
- UTM tags for outbound affiliate links.

### SEO
- Title: `World Cup 2026 Travel Planner | Plan Your Trip to Every Host City`  
- Meta Description: `Plan your 2026 World Cup trip from start to finish — flights, lodging, match routes, and local experiences for every host city.`  
- Canonical: `/planner`

---

## 🧩 HANDOFF CHECKLIST

| Item | Status | Owner |
|------|---------|-------|
| Nav label updated from “AI Planner” → “Travel Planner” | ✅ | Dev |
| `/planner` hero + copy implemented | 🔲 | Dev |
| 4-phase grid cards built with links | 🔲 | Dev |
| Placeholder state for “On the Ground” | 🔲 | Dev |
| Analytics + SEO tags configured | 🔲 | Dev |
| Newsletter + Guide CTAs added | 🔲 | Dev |

---

### ✨ Key Message to Preserve
> “The Fan Zone Travel Planner isn’t just about getting there — it’s about making the most of the journey.”



🧱 WC26_FanZone_Dev_Update_List.md

Last updated: Oct 22, 2025
Prepared for: WC26 Dev + Design Team
Structure: Tasks grouped by Priority (High → Medium → Low)
Tone: Developer-oriented — ready for issue tickets or sprint breakdowns

⸻

🟥 HIGH PRIORITY

1. Core Performance / Launch Readiness
	•	Optimize all page load speeds — compress hero GIF, lazy-load city/team card images, enable Next.js image optimization.
🧩 performance | 🎯 High | 💬 Expect ≤2.5s LCP on homepage and guides grid.
	•	Enable HTTPS across all subdomains (main + Beehiv + Vercel).
🧩 infrastructure | 🎯 High | 💬 Current “Not Secure” flag on some pages (team detail).
	•	Ensure all links resolve correctly — fix /teams/[slug] routing, remove broken 404s.
🧩 routing | 🎯 High | 💬 Validate all team/city dynamic routes on deploy preview.
	•	Connect Waitlist forms to backend (Supabase or Lemon Squeezy webhook).
🧩 backend | 🎯 High | 💬 Capture email, source page, and timestamp for analytics.
	•	Add basic SEO meta structure (title, description, canonical) for all top-level pages.
🧩 SEO | 🎯 High | 💬 Pull from structured frontmatter or Next SEO config.

⸻

2. Navigation + Global
	•	Implement sticky nav on scroll for consistent UX.
🧩 UI | 🎯 High
	•	Update nav labels for clarity: change “AI Planner” → “Travel Planner.”
🧩 content | 🎯 High | 💬 Reflects user testing feedback (less technical tone).
	•	Add ‘About’ + ‘Contact’ links in footer for trust + SEO.
🧩 UI/SEO | 🎯 High
	•	Fix language toggle (i18n) — ensure content loads correctly in EN/ES/FR/PT/AR.
🧩 i18n | 🎯 High | 💬 Connect locales to JSON or Supabase-driven content fields.

⸻

3. Forums (Backend Build Required)
	•	Connect city-level forums to database schema.
🧩 backend/db | 🎯 High | 💬 Create forums table with city_id, topic, replies, views.
	•	Create generic forum template with placeholder topics until city data loads.
🧩 UI | 🎯 High | 💬 Add fallback “Join the conversation for [CITY] soon!” state.
	•	Implement thread + reply functionality with Supabase row-level security.
🧩 backend/security | 🎯 High
	•	Moderation system MVP — auto-flag spam keywords.
🧩 backend | 🎯 High | 💬 Can use regex or simple AI moderation endpoint later.

⸻

4. Teams + Team Pages
	•	Add link wrapping for each team card → /teams/[slug].
🧩 frontend | 🎯 High
	•	Dynamic data pull: connect team info (ranking, confederation, history) to Supabase.
🧩 backend/db | 🎯 High
	•	“Follow Team” button integration → link to waitlist with team_id param.
🧩 backend/integration | 🎯 High
	•	Responsive optimization for team pages — current hero text overlaps on smaller screens.
🧩 UI/responsive | 🎯 High

⸻

5. City Guides
	•	Implement dynamic city guide pages (/guides/[slug]) using current cards.
🧩 frontend | 🎯 High
	•	Connect each “Download Free Guide” CTA to actual Lemon Squeezy or file endpoint.
🧩 integration | 🎯 High
	•	Add “Coming Soon” automation → auto-switch to active once file uploaded.
🧩 backend | 🎯 High

⸻

🟨 MEDIUM PRIORITY

1. Homepage Enhancements
	•	Add fan count / social proof bar below hero CTA (“2,000+ fans joined”).
🧩 UI | 🎯 Medium
	•	Add hover effects on CTA buttons for visual engagement.
🧩 UI | 🎯 Medium
	•	Insert secondary CTA under “See How It Works” video → “Join the waitlist now.”
🧩 content | 🎯 Medium
	•	Add hover tooltips to timeline milestones.
🧩 UX | 🎯 Medium

⸻

2. Teams + Team Detail Pages
	•	Add “Back to Teams” sticky link at top of all /teams/[slug] pages.
🧩 UI | 🎯 Medium
	•	Embed short highlight video or YouTube link placeholder in “Greatest Moments.”
🧩 frontend | 🎯 Medium
	•	Add schema.org structured data for teams (for Google snippets).
🧩 SEO | 🎯 Medium
	•	Include “Fan Culture” social sharing buttons (X, Threads, Reddit).
🧩 UI | 🎯 Medium

⸻

3. City Guides
	•	Add small map preview or static image of stadium per city card.
🧩 frontend | 🎯 Medium
	•	Enable search + filter by country (USA, MEX, CAN).
🧩 frontend/UX | 🎯 Medium
	•	Add “Get bundle” CTA block post-launch (Dec 2025).
🧩 UI | 🎯 Medium

⸻

4. Newsletter (Beehiiv)
	•	Embed Beehiiv signup form directly in site footer.
🧩 integration | 🎯 Medium
	•	Sync waitlist signups → Beehiiv API for centralized email list.
🧩 backend | 🎯 Medium
	•	Add custom success message: “You’re in! Expect the next edition every Thursday.”
🧩 UX | 🎯 Medium

⸻

5. AI Travel Planner
	•	Integrate front-end form inputs with Supabase logging (cities, group size, budget).
🧩 backend | 🎯 Medium
	•	Add simple loading animation during API call.
🧩 UI | 🎯 Medium
	•	Generate downloadable trip summary (PDF via Pandoc).
🧩 backend/pdf | 🎯 Medium

⸻

🟩 LOW PRIORITY

1. Aesthetic / Micro-Interaction
	•	Add scroll-based animation for “Road to the World Cup” timeline.
🧩 frontend/animation | 🎯 Low
	•	Add favicon and OG preview images for each section.
🧩 SEO | 🎯 Low
	•	Add subtle background gradient shift on hover for feature cards.
🧩 UI | 🎯 Low
	•	Add confetti animation or particle burst on successful signup.
🧩 frontend/fx | 🎯 Low

⸻

2. Accessibility / Compliance
	•	Audit color contrast (esp. purple/blue gradients).
🧩 accessibility | 🎯 Low
	•	Add ARIA labels for buttons and icons.
🧩 frontend/a11y | 🎯 Low
	•	Keyboard nav test on all CTAs.
🧩 frontend/a11y | 🎯 Low

⸻

🚀 Launch Checklist (Target: Dec 5, 2025)
	•	✅ HTTPS + custom domain verified
	•	✅ Waitlist functional (Supabase + Beehiiv sync)
	•	✅ All team + city slugs connected
	•	✅ SEO meta + sitemap.xml generated
	•	✅ Page load <2.5s (mobile + desktop)
	•	✅ Legal pages (Privacy, ToS, Contact)
	•	✅ Email + guide download endpoints tested


punch list

1 - language pop up/localization not working
2- take away eexplore features button on herro section
3- forums and ai planner sign ins give failed to fetch error
4 - on forums, delete the top messages above the forums
5- forums do not load
6- travel planner work
7 - Join Waitlist at top right of nav bar does nothing, change the link
8 - front page - qualified teams - keep but remove meention of the provisional
9 - group draw box on home page - black text over blue not readable - make it white text
10 - Demo- see how it works should be above the qualified teams
11 - timeline now at bottom of homepage should be higher, qualified teams should be at the bottom.

---

## 🏃 SPRINT PLANS

### **SPRINT 1: Critical Fixes & Homepage Polish** (3-5 days)
**Goal:** Fix blocking issues and improve homepage UX based on punch list.

**Tasks:**
1. **Fix Language Modal/Localization** (Punch #1)
   - Debug i18n modal not triggering or closing properly
   - Verify cookie persistence for language selection
   - Test ES/FR/PT/AR content loading

2. **Remove "Explore Features" Button** (Punch #2)
   - Remove or hide this CTA from hero section
   - Ensure hero focuses on "Join Waitlist" primary action

3. **Fix Join Waitlist Link in Nav** (Punch #7)
   - Update header nav link to functional waitlist form or modal
   - Add tracking event for nav waitlist clicks

4. **Homepage Reordering** (Punch #10, #11)
   - Move "Demo - See How It Works" section ABOVE Qualified Teams
   - Move Timeline section HIGHER on page
   - Keep Qualified Teams section at BOTTOM

5. **Qualified Teams Copy Update** (Punch #8)
   - Remove all mentions of "provisional teams" from copy
   - Keep the 28 qualified teams display as-is

6. **Group Draw Text Contrast Fix** (Punch #9)
   - Change black text to white in group draw box (blue background)
   - Verify readability across all breakpoints

**Deliverables:**
- Homepage with improved flow and visual hierarchy
- Working waitlist CTAs
- Fixed language selector
- All punch list visual/copy issues resolved

---

### **SPRINT 2: Authentication & Forums Foundation** (5-7 days)
**Goal:** Fix auth errors and get forums functional.

**Tasks:**
1. **Fix Auth Errors** (Punch #3)
   - Debug "Failed to fetch" errors on Forums and AI Planner sign-in
   - Verify Supabase client initialization and environment variables
   - Test auth modal across all protected pages
   - Add error handling and user-friendly error messages

2. **Forums Top Messages Cleanup** (Punch #4)
   - Remove placeholder/test messages above forum list
   - Clean up any debug text or Lorem ipsum

3. **Fix Forums Not Loading** (Punch #5)
   - Debug forum threads not fetching from Supabase
   - Verify RLS policies on forums tables
   - Add loading states and empty states
   - Test forum thread creation and reply functionality

4. **Forums Backend Completion**
   - Ensure `forums`, `threads`, `posts` tables properly configured
   - Implement basic moderation (auto-flag spam keywords)
   - Add city-level forum routing `/forums/[city]`
   - Create generic forum template with fallback state

**Deliverables:**
- Functional authentication across site
- Forums loading correctly with threads and replies
- Clean forum UI without placeholder content
- Basic moderation in place

---

### **SPRINT 3: Travel Planner Rebuild** (5-7 days)
**Goal:** Build out the 4-phase Travel Planner structure per spec.

**Tasks:**
1. **Planner Hub Page** (Punch #6)
   - Build `/planner` landing page with hero section
   - Create 4-phase grid (Trip Builder, Flights, Lodging, On the Ground)
   - Each card links to dedicated sub-page
   - Add intro text and footer CTA section

2. **Trip Builder Phase** (`/planner/trip-builder`)
   - AI-assisted route suggestions by team
   - Map visualization (USA/Canada/Mexico)
   - Match schedule integration
   - Distance/time estimates between cities
   - Exportable itinerary (PDF)

3. **Flights Phase** (`/planner/flights`)
   - City-to-city dropdown selectors
   - Skyscanner/Google Flights deep links
   - Flight summary cards with prices/durations
   - AI tips for flexible booking

4. **Lodging Phase** (`/planner/lodging`)
   - Booking.com/Expedia deep links by city
   - Stadium radius filters (3km, 5km, 10km)
   - "Fan Zone Recommends" tags
   - Save favorite stays functionality

5. **On the Ground Placeholder** (`/planner/on-the-ground`)
   - "Coming May 2026" state
   - Email signup for launch notification
   - Preview of future features (transport, fan fests, safety tips)

**Deliverables:**
- Complete 4-phase Travel Planner system
- Working links and integrations
- AI recommendations where specified
- Analytics tracking on all phase interactions

---

### **SPRINT 4: Teams & City Guides Enhancement** (4-5 days)
**Goal:** Complete dynamic team pages and city guide functionality.

**Tasks:**
1. **Team Pages Polish**
   - Add "Back to Teams" sticky navigation
   - Embed highlight video placeholders in "Greatest Moments"
   - Add schema.org structured data for SEO
   - Social sharing buttons (X, Threads, Reddit)
   - Fix responsive issues on smaller screens

2. **City Guides Dynamic Pages**
   - Build `/guides/[slug]` dynamic routing
   - Connect "Download Free Guide" CTAs to actual PDFs/LemonSqueezy
   - Add "Coming Soon" automation for unreleased guides
   - Small map preview per city card
   - Search/filter by country (USA, MEX, CAN)

3. **Team Card Links**
   - Wrap all team cards with proper routing to `/teams/[slug]`
   - "Follow Team" button → waitlist with team_id param
   - Dynamic data pull from Supabase (ranking, confederation, history)

**Deliverables:**
- Polished team detail pages with all sections working
- Dynamic city guide pages with download functionality
- Search and filter capabilities
- Proper routing and data connections

---

### **SPRINT 5: Performance, SEO & Infrastructure** (3-4 days)
**Goal:** Optimize site performance and prepare for launch.

**Tasks:**
1. **Performance Optimization**
   - Compress hero GIF and all large images
   - Enable Next.js Image component optimization
   - Lazy-load city/team card images
   - Target ≤2.5s LCP across all pages
   - Test on mobile and desktop

2. **SEO Implementation**
   - Add title, description, canonical for all pages
   - Generate sitemap.xml
   - Add Open Graph images for social sharing
   - Implement schema.org markup where applicable
   - Verify all internal links resolve correctly

3. **HTTPS & Domain Setup**
   - Enable HTTPS across all subdomains
   - Fix "Not Secure" warnings
   - Verify SSL certificates

4. **Routing Validation**
   - Test all `/teams/[slug]` routes
   - Verify dynamic city pages
   - Fix any 404s or broken links
   - Test forum routing `/forums/[city]`

**Deliverables:**
- Fast page loads (≤2.5s LCP)
- Complete SEO meta structure
- All links functional
- Secure HTTPS everywhere

---

### **SPRINT 6: Integrations & Final Polish** (3-4 days)
**Goal:** Connect external services and add finishing touches.

**Tasks:**
1. **Newsletter Integration**
   - Embed Beehiiv signup in footer
   - Sync waitlist → Beehiiv API
   - Custom success message
   - Test email capture flow

2. **Waitlist Backend**
   - Connect all waitlist forms to Supabase
   - Capture email, source page, timestamp
   - Add analytics tracking
   - Test LemonSqueezy webhook if using for paid guides

3. **Navigation & Footer**
   - Implement sticky nav on scroll
   - Update "AI Planner" → "Travel Planner" everywhere
   - Add About + Contact links in footer
   - Verify language toggle works completely

4. **Accessibility Audit**
   - Check color contrast (gradients)
   - Add ARIA labels to buttons/icons
   - Test keyboard navigation
   - Verify screen reader compatibility

5. **Micro-Interactions**
   - Add hover effects on CTA buttons
   - Scroll animations for timeline
   - Loading animations for AI planner
   - Success states for form submissions

**Deliverables:**
- All integrations functional (Beehiiv, Supabase, LemonSqueezy)
- Polished UI with micro-interactions
- Accessibility compliance
- Complete navigation structure

---

### **SPRINT 7: Testing & Launch Prep** (2-3 days)
**Goal:** Final QA and launch checklist completion.

**Launch Checklist:**
- [ ] HTTPS + custom domain verified
- [ ] Waitlist functional (Supabase + Beehiiv sync)
- [ ] All team + city slugs connected and tested
- [ ] SEO meta + sitemap.xml generated
- [ ] Page load <2.5s (mobile + desktop)
- [ ] Legal pages (Privacy, ToS, Contact) in place
- [ ] Email + guide download endpoints tested
- [ ] Forums fully functional with moderation
- [ ] Authentication working across all protected pages
- [ ] Travel Planner all 4 phases live
- [ ] Language selector working (EN/ES/FR/PT/AR)
- [ ] Analytics tracking verified
- [ ] Mobile responsiveness tested
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Error pages (404, 500) styled and functional

**Final Tasks:**
1. Comprehensive testing across all pages
2. Fix any remaining bugs from testing
3. Verify all analytics events firing
4. Load test with expected traffic
5. Backup database before launch
6. Prepare rollback plan
7. Schedule launch and announcement

**Target Launch:** December 5, 2025

---

## 📊 Sprint Summary

| Sprint | Duration | Focus Area | Key Deliverables |
|--------|----------|------------|------------------|
| **Sprint 1** | 3-5 days | Critical Fixes & Homepage | Fixed punch list, homepage reordered, waitlist links working |
| **Sprint 2** | 5-7 days | Auth & Forums | Working authentication, functional forums with moderation |
| **Sprint 3** | 5-7 days | Travel Planner | Complete 4-phase planner system |
| **Sprint 4** | 4-5 days | Teams & City Guides | Polished team pages, dynamic city guides |
| **Sprint 5** | 3-4 days | Performance & SEO | Fast loads, complete SEO, HTTPS everywhere |
| **Sprint 6** | 3-4 days | Integrations & Polish | Newsletter, waitlist, accessibility, micro-interactions |
| **Sprint 7** | 2-3 days | Testing & Launch | QA complete, launch checklist verified |

**Total Timeline:** ~4-6 weeks to complete all sprints

**Recommended Approach:** 
- Sprints 1-2 should be completed first (blocking issues)
- Sprints 3-4 can run in parallel with separate developers
- Sprints 5-7 should be sequential for proper testing and launch prep 
