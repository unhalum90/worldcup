-- Migration: User Profile core schema with RLS
-- Created: 2025-10-25

-- Enums via CHECK constraints (portable). Adjust to real enums later if desired.
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  home_city TEXT,
  home_airport JSONB,
  group_size INT DEFAULT 1 CHECK (group_size >= 1),
  children INT DEFAULT 0 CHECK (children >= 0),
  seniors INT DEFAULT 0 CHECK (seniors >= 0),
  mobility_issues BOOLEAN DEFAULT FALSE,
  budget_level TEXT CHECK (budget_level IN ('budget','moderate','premium')),
  comfort_preference TEXT CHECK (comfort_preference IN ('budget_friendly','balanced','luxury_focus')),
  food_preference TEXT CHECK (food_preference IN ('local_flavors','international','mix')),
  nightlife_preference TEXT CHECK (nightlife_preference IN ('quiet','social','party')),
  climate_preference TEXT CHECK (climate_preference IN ('avoid_heat','open_to_hot','prefer_warm')),
  travel_focus TEXT[] DEFAULT '{}'::text[],
  preferred_transport TEXT CHECK (preferred_transport IN ('public','car','mixed')),
  languages TEXT[],
  currency TEXT,
  favorite_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_user ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_travel_focus ON user_profile USING GIN (travel_focus);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION up_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profile_updated ON user_profile;
CREATE TRIGGER trg_user_profile_updated BEFORE UPDATE ON user_profile
FOR EACH ROW EXECUTE FUNCTION up_set_updated_at();

-- RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_select_own" ON user_profile;
CREATE POLICY "profile_select_own"
  ON user_profile FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_insert_own" ON user_profile;
CREATE POLICY "profile_insert_own"
  ON user_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_update_own" ON user_profile;
CREATE POLICY "profile_update_own"
  ON user_profile FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
