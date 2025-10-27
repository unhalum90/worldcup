# World Cup 2026 Flight Planner Module – Complete Implementation Plan

## Executive Summary

This document outlines the complete technical and product implementation plan for the **World Cup 2026 Flight Planner**, part of the Fan Zone travel planning ecosystem. The Flight Planner enables members to generate intelligent flight itineraries aligned with their Trip Builder routes, providing **advisory recommendations only** (no direct booking).  

The system integrates contextual reasoning (via Gemini), real flight-price estimation (via Google Flights / Skyscanner API), and localized travel insights derived from the existing RAG corpus for all 16 host cities.

---

## 1. Goals & Objectives

**Primary Objective:**  
Help users make informed travel decisions between World Cup host cities by automatically generating a data-driven *Trip Brief* that includes flight options, alt airports, and ground transport guidance.

**Key Outcomes**
- Seamless import from Trip Builder itineraries.  
- Context-aware recommendations (Smartest, Budget, Fastest).  
- Inclusion of regional insights and ground connections.  
- Export to Markdown → HTML → PDF.  
- Member-only feature within `/flight-planner`.

---

## 2. Technology Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | Next.js 15 (App Router), React 18, TailwindCSS |
| **Backend** | Supabase (Auth, Postgres, RLS) |
| **AI Engine** | Gemini 1.5 via API – RAG over city Markdown files |
| **External Data** | Google Flights / Skyscanner API for sample fares |
| **Storage / Exports** | Supabase Storage + Manus / Pandoc for PDF |
| **Hosting** | Vercel (Pro tier) |

---

## 3. Data Model (Supabase)

**Tables**
- `trip_itineraries` – imported from Trip Builder  
  - `user_id`, `trip_name`, `legs[]`, `created_at`
- `flight_plans` – generated outputs  
  - `id`, `trip_id`, `summary_md`, `ai_context`, `pricing_snapshot`, `created_at`
- `airports` – master list (`iata`, `city`, `alt_airports[]`, `country`, `distance_to_stadium_km`)
- `api_logs` – track Gemini + pricing API usage

**Security**
- Row Level Security (RLS) restricted by `auth.uid()`.  
- Non-members blocked from `/api/flight-planner/*`.

---

## 4. Core Algorithm Logic

### Step 1 – Context Ingestion
- Pull user’s Trip Builder itinerary.  
- Gather RAG docs for each origin/destination city.  
- Identify primary & alternate airports via `airports.csv`.

### Step 2 – Pricing Snapshot
- Query Google Flights / Skyscanner API once per route pair for average economy fare (cached for 12 h).  
- Store only summarized pricing (no live links).

### Step 3 – AI Synthesis (Gemini)
Prompt combines:
- Itinerary context  
- City RAG data (transportation, weather, altitude, airport notes)  
- Pricing snapshot  

Gemini outputs structured Markdown sections:
1. Smartest Option  
2. Budget Option  
3. Fastest Option  
4. Regional Travel Tips  
5. Alternate Airport Recommendations  

### Step 4 – Output
- Convert Markdown → HTML → PDF (“Trip Brief”).  
- Save to `flight_plans` and allow download or email delivery.

---

## 5. API Endpoints

| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/flight-planner/generate` | POST | Generate Trip Brief from itinerary or manual input |
| `/api/flight-planner/save` | POST | Save generated brief to Supabase |
| `/api/flight-planner/:id` | GET | Retrieve saved plan |
| `/api/flight-planner/pricing` | GET | (Internal) Fetch cached pricing snapshots |

---

## 6. Component Architecture (Frontend)