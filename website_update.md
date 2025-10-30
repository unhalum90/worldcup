# Website Edit Implementation Plan  
**Project:** World Cup 26 Fan Zone  
**Date:** October 30, 2025  
**Author:** Eric Chamberlin  

---

Before starting, lots of work was done on localization - check status of this work and report back on what is included in this commit/branch

## 🔧 Overview
This document outlines required updates to the **Fan Zone website** (frontend and Supabase auth logic). The goal is to unify authentication under a single Supabase Magic Link flow, correct visual/UI issues, and make small content and component updates across the site.

---

## 🚨 Priority 1 — Authentication Refactor

### Objective
Eliminate the legacy email/password authentication flow and replace it entirely with Supabase Magic Link authentication for both **new** and **returning** users.

### Current Behavior
- **"Plan My Trip (Free)" CTA** → triggers modal → Supabase Magic Link signup for *new accounts*.  
- **"Sign In" (top-right nav)** → opens legacy login modal with email/password input.  
- When an **existing user** clicks *Plan My Trip (Free)*, Supabase currently does **not** send a Magic Link since the account already exists → user receives no feedback.

### Required Updates
| Task | Description | Component/Area | Notes |
|------|--------------|----------------|-------|
| **1.1 Remove Legacy Auth Modal** | Delete old email/password login modal and replace it with Magic Link form identical to “Plan My Trip (Free)” modal | `/components/AuthModal.tsx` or equivalent | Ensure single source of truth for all auth modals |
| **1.2 Add Existing Account Failsafe** | When an email already exists, show message: “This email is already registered — check your inbox for a Magic Link to sign in.” | Supabase API / error handling logic | Capture Supabase `error.code === 'user_already_exists'` |
| **1.3 Reuse Modal for Login + Signup** | “Sign In” and “Plan My Trip (Free)” buttons should open the same modal (Magic Link flow). | Frontend routing / shared modal state | Standardize across pages |
| **1.4 Verify Supabase Redirect Flow** | After clicking the Magic Link, user should be redirected and logged in automatically to previous location or `/dashboard`. | Supabase Auth settings | Check `redirectTo` environment variable in `.env.local` |

---

## 🏠 Homepage Updates

| Task | Description | Location | Notes |
|------|--------------|-----------|-------|
| **2.1 Fix Button Text Contrast** | Change text color from black → white on the button below the “28 Teams Qualified” section. | `/pages/index.tsx` | Maintain accessibility contrast (WCAG AA) |
| **2.2 Remove Footer Fan Forum Description** | Delete the paragraph describing “Fan Forums” from the footer. | `/components/Footer.tsx` | This section is deprecated |
| **2.3 Verify Footer Sync** | Ensure footer edits propagate globally across all pages (Teams, Guides, etc.). | Layout or `_app.tsx` wrapper | Confirm single shared footer component |

---

## ⚽ Teams Page

| Task | Description | Location | Notes |
|------|--------------|-----------|-------|
| **3.1 Inherit Footer Edits** | No specific changes to this page. Ensure footer updates apply globally. | `/pages/teams.tsx` | — |

---

## 🧭 Guides Page

### Current Sections (4):
1. Neighborhood Zones  
2. Transport  
3. Tips  
4. Fan Hotspots  
5. Local Insights

### Required Update
| Task | Description | Location | Notes |
|------|--------------|-----------|-------|
| **4.1 Replace “Fan Hotspots” Section** | Rename/remove “Fan Hotspots” and replace it with **“Flight Itineraries — Review which airports are best for your trip.”** | `/pages/guides.tsx` or relevant content JSON/Markdown | Ensure copy update in all languages if multilingual |

---

## ✅ Acceptance Criteria
- [ ] Magic Link flow replaces all password-based login forms.  
- [ ] Users with existing accounts see helpful feedback and can log in via Magic Link.  
- [ ] Button text color updated for visibility (white text).  
- [ ] Footer updated globally, removing Fan Forum references.  
- [ ] “Fan Hotspots” section replaced with “Flight Itineraries” on Guides page.  
- [ ] No console errors or Supabase auth redirect issues after deploy.

---

## 🔄 Estimated Implementation Effort
| Area | Level of Effort | Dependencies |
|------|----------------|---------------|
| Authentication Refactor | **High** | Supabase Auth logic, modal components |
| Homepage UI Fixes | **Low** | Tailwind styling |
| Footer Cleanup | **Low** | Shared layout |
| Guides Page Copy Update | **Low** | Static content / localization files |

---

## 👥 Responsible
- **Frontend Dev:** AI Web Team  
- **Backend (Supabase):** Eric / Dev Team  
- **QA / Approval:** Eric Chamberlin  

---

## 🧩 Next Steps
1. Create branch `feature/auth-magiclink-refactor`.  
2. Implement auth modal unification and Supabase error handling.  
3. Push UI and content updates across homepage and guides.  
4. Deploy to staging → verify Magic Link flow and redirects.  
5. Merge to production.

---