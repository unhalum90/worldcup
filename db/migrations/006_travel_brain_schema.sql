-- Migration: World Cup Travel Brain Database Schema
-- Created: 2025-10-19
-- Purpose: Support AI travel planning for World Cup 2026
-- Note: Works with existing cities table (id, name, slug, country, tz)

-- ========================================
-- 1. Update cities table (add new columns for Travel Brain)
-- ========================================

-- Add stadium coordinates
ALTER TABLE cities ADD COLUMN IF NOT EXISTS stadium_name TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS stadium_lat DECIMAL(9,6);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS stadium_long DECIMAL(9,6);

-- Add fan fest coordinates
ALTER TABLE cities ADD COLUMN IF NOT EXISTS fan_fest_location TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS fan_fest_lat DECIMAL(9,6);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS fan_fest_long DECIMAL(9,6);

-- Add travel hub flag
ALTER TABLE cities ADD COLUMN IF NOT EXISTS is_hub BOOLEAN DEFAULT FALSE;

-- Add airport code
ALTER TABLE cities ADD COLUMN IF NOT EXISTS airport_code TEXT;

-- Add updated_at column for triggers
ALTER TABLE cities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Index for hub lookups
CREATE INDEX IF NOT EXISTS idx_cities_hub ON cities(is_hub);

-- ========================================
-- 2. Create zones table (lodging areas)
-- ========================================
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  long DECIMAL(9,6) NOT NULL,
  
  -- Travel times (in minutes)
  drive_time_to_stadium INTEGER,
  public_time_to_stadium INTEGER,
  drive_time_to_fanfest INTEGER,
  public_time_to_fanfest INTEGER,
  
  -- Attributes (1-10 scale)
  transit_quality INTEGER CHECK (transit_quality BETWEEN 1 AND 10),
  hotel_density INTEGER, -- count of hotels
  safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 10),
  nightlife_score INTEGER CHECK (nightlife_score BETWEEN 1 AND 10),
  family_score INTEGER CHECK (family_score BETWEEN 1 AND 10),
  
  -- Categories & metadata
  tag TEXT, -- 'budget', 'mid-range', 'premium', 'alternative'
  fan_vibe TEXT,
  parking_availability TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(city_id, zone_name)
);

-- Index for zone lookups
CREATE INDEX IF NOT EXISTS idx_zones_city ON zones(city_id);
CREATE INDEX IF NOT EXISTS idx_zones_tag ON zones(tag);

-- ========================================
-- 3. Create matches table
-- ========================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  stadium_name TEXT NOT NULL,
  
  -- Match details
  match_number INTEGER,
  stage TEXT, -- 'group', 'round_of_16', 'quarter', 'semi', 'final'
  group_name TEXT, -- 'Group A', 'Group B', etc.
  
  -- Teams (TBD until draw)
  home_team TEXT,
  away_team TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for match lookups
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_city ON matches(city_id);
CREATE INDEX IF NOT EXISTS idx_matches_team ON matches(home_team, away_team);

-- ========================================
-- 4. Create travel_plans table (user itineraries)
-- ========================================
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User inputs
  origin_city TEXT,
  group_size INTEGER,
  children INTEGER DEFAULT 0,
  seniors INTEGER DEFAULT 0,
  mobility_issues BOOLEAN DEFAULT FALSE,
  transport_mode TEXT, -- 'public', 'car', 'mixed'
  budget_level TEXT, -- 'budget', 'moderate', 'premium'
  
  -- Cities visiting
  cities_visiting TEXT[], -- array of city names
  following_team TEXT,
  
  -- Travel dates
  start_date DATE,
  end_date DATE,
  
  -- Generated itinerary (JSON)
  itinerary JSONB,
  
  -- User tracking
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for tracking
CREATE INDEX IF NOT EXISTS idx_travel_plans_email ON travel_plans(user_email);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created ON travel_plans(created_at DESC);

-- ========================================
-- 5. Functions & Triggers
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cities
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for zones
DROP TRIGGER IF EXISTS update_zones_updated_at ON zones;
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for matches
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for travel_plans
DROP TRIGGER IF EXISTS update_travel_plans_updated_at ON travel_plans;
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. Row Level Security (RLS)
-- ========================================

-- Enable RLS on tables (IF NOT EXISTS style - won't fail if already enabled)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're current
-- (This is safer than CREATE IF NOT EXISTS for policy updates)

-- Cities policies
DROP POLICY IF EXISTS "Public can read cities" ON cities;
DROP POLICY IF EXISTS "public_select_cities" ON cities;
CREATE POLICY "Public can read cities"
  ON cities FOR SELECT
  USING (true);

-- Zones policies
DROP POLICY IF EXISTS "Public can read zones" ON zones;
CREATE POLICY "Public can read zones"
  ON zones FOR SELECT
  USING (true);

-- Matches policies
DROP POLICY IF EXISTS "Public can read matches" ON matches;
CREATE POLICY "Public can read matches"
  ON matches FOR SELECT
  USING (true);

-- Travel plans: users can read their own
DROP POLICY IF EXISTS "Users can read own travel plans" ON travel_plans;
CREATE POLICY "Users can read own travel plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id OR user_email IS NOT NULL);

-- Travel plans: anyone can insert (for guest users)
DROP POLICY IF EXISTS "Anyone can create travel plans" ON travel_plans;
CREATE POLICY "Anyone can create travel plans"
  ON travel_plans FOR INSERT
  WITH CHECK (true);

-- Admins have full access to all tables
DROP POLICY IF EXISTS "Admins have full access to cities" ON cities;
CREATE POLICY "Admins have full access to cities"
  ON cities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins have full access to zones" ON zones;
CREATE POLICY "Admins have full access to zones"
  ON zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins have full access to matches" ON matches;
CREATE POLICY "Admins have full access to matches"
  ON matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
