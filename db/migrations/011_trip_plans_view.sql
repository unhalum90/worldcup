-- Migration 011: Align travel plan storage with profile onboarding and expose a trip_plans view
-- Date: 2025-10-25

-- 1) Enrich the existing travel_plans table with the fields captured during onboarding / planners.
ALTER TABLE travel_plans
  ADD COLUMN IF NOT EXISTS origin_airport JSONB,
  ADD COLUMN IF NOT EXISTS trip_focus TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS has_match_tickets BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS match_dates TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ticket_cities TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS personal_context TEXT,
  ADD COLUMN IF NOT EXISTS surprise_me BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS food_preference TEXT,
  ADD COLUMN IF NOT EXISTS nightlife_preference TEXT,
  ADD COLUMN IF NOT EXISTS climate_preference TEXT;

-- 2) Provide a stable trip_plans view (spec name) over travel_plans so future code
-- can depend on the unified schema without changing the existing write path yet.
DROP VIEW IF EXISTS trip_plans;

CREATE VIEW trip_plans AS
SELECT
  id,
  user_id,
  origin_city,
  origin_airport,
  group_size,
  children,
  seniors,
  mobility_issues,
  transport_mode,
  budget_level,
  trip_focus,
  cities_visiting,
  has_match_tickets,
  match_dates,
  ticket_cities,
  personal_context,
  surprise_me,
  food_preference,
  nightlife_preference,
  climate_preference,
  following_team,
  start_date,
  end_date,
  itinerary,
  created_at,
  updated_at
FROM travel_plans;

COMMENT ON VIEW trip_plans IS 'Compatibility view over travel_plans so new services can SELECT * FROM trip_plans without breaking the existing writer.';
