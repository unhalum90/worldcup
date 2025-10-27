# ⚽ World Cup 26 Fan Zone — Pricing Plan (v3.0)

**Date:** October 26, 2025  
**Purpose:** Finalized pricing structure for MVP demo build and upcoming store activation.

---

## 🧭 Overview

Two simple pricing sections for launch:
1. **City Guides (PDFs)** — one-time purchases for individual or multi-city planning.  
2. **Fan Zone Membership** — one-time upgrade unlocking all AI planners, one free guide, and discounted add-ons.

This version removes the 16-city option (no real traveler will visit all).  
The 5-city Guide Pack becomes the top product tier for city guides.

---

## 🧾 CITY GUIDES (PDFs)
*One-time purchase · Instant download · Updated after the Draw*

**Headline:**  
**Plan smarter. Explore confidently.**  
Get beautifully designed, research-driven travel guides for the host cities you’ll visit.

| Product | Price | Best For |
|----------|--------|----------|
| **Single City Guide (PDF)** | **$3.99** | Visiting one or two host cities |
| **Guide Pack (5 PDFs)** | **$9.99** | Following your team through the group phase and knockouts |

### Each PDF Includes:
✅ Lodging Zone recommendations (ranked by access, value, and atmosphere)  
✅ Stadium & transport logistics  
✅ Neighborhood maps and cultural insights  
✅ Fan Fest and event details  
✅ Local travel and matchday tips  
✅ Downloadable / printable format  

**CTAs:**  
- “Unlock a City Guide — $3.99”  
- “Get 5 Guides — $9.99”

📝 *Note:* All guides will automatically update after the **Dec 5 World Cup Draw** and will be reissued to buyers via email.

---

## 💎 FAN ZONE MEMBERSHIP
*One-time payment · Unlocks all AI planners and exclusive benefits*

**Headline:**  
**Go all in with the Fan Zone Membership**

**Launch Price:** $29.99 *(Early Bird through Nov 30, 2025)*  
**Regular Price:** $39

### Includes:
- 🏙️ **1 Free City Guide (PDF)** of your choice  
- ✈️ **Unlimited use of AI Trip, Flight, and Lodging Planners**  
- 📘 **Discounted additional guides ($2.99 each)**  
- 🕓 **Priority Support** (email response within 24 hours)  
- 🔔 **Automatic updates after Draw Day (Dec 5)**  
- 🌍 **Early Access** to new tools and cities as released

**CTA:**  
> “Join Now — Plan Every Match Smarter”

---

## 💡 DESIGN & UX NOTES

- Two clearly separated sections on pricing page:
  - **Section 1:** City Guides (light grey background)  
  - **Section 2:** Membership (white or subtle gold-tint background)
- Use iconography for visual rhythm:  
  - 📖 for Guides  
  - 💎 for Membership  
- Color scheme:  
  - Blue buttons for City Guides  
  - Gold buttons for Membership
- Add “Updated after Draw” badge to build trust.

**Homepage Banner Example:**  
> “Free to explore teams & cities. Pay once for the guides and planners that simplify your trip.”

---

## 🧱 STORE DEMO REQUIREMENTS

### Front-End
- Dynamic pricing cards for:
  - Single Guide ($3.99)
  - 5-Guide Pack ($9.99)
  - Membership ($29.99 Early Bird)
- Stripe integration (test mode for demo)
- Supabase user table updates on purchase:
  - `membership_level`
  - `user_guides` (array of purchased guides)
- Placeholder “Coming Dec 5” badge for membership section.

### Back-End
- All purchased PDFs delivered from Supabase Storage (secure link)
- Membership flag unlocks access to AI planners
- Email automation (Make.com / Beehiiv):
  - Purchase confirmation  
  - Guide download links  
  - “Upgrade to Membership” upsell (after 2 purchases)

---

## 🧠 SUMMARY SNAPSHOT

| Tier | Type | Price | Key Access |
|------|------|--------|-------------|
| Free Access | Free | $0 | Team pages, city pages, newsletter |
| Single City Guide | One-time | $3.99 | One PDF guide |
| 5-Guide Pack | One-time | $9.99 | Five PDFs (team/group phase) |
| Fan Zone Membership | One-time | $29.99 (launch) | AI Planners + 1 free guide + $2.99 discounts |

---

**Next Steps:**  
- Implement pricing cards in Next.js site before store activation.  
- Connect Stripe test environment.  
- Test PDF delivery and membership unlock.  
- Publish updated pricing text on `/pricing` page and Free Dallas Guide upsell.
