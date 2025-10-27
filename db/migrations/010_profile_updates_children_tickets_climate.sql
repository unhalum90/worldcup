-- Migration 010: Profile updates for children age groups, tickets info, and climate options
-- Date: 2025-10-25

-- Add children age buckets (keep legacy children for backward-compat aggregation)
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS children_0_5 INT DEFAULT 0 CHECK (children_0_5 >= 0),
  ADD COLUMN IF NOT EXISTS children_6_18 INT DEFAULT 0 CHECK (children_6_18 >= 0);

-- Add tickets flags and match info (JSONB stores {city, stadium, date, match, country})
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS has_tickets BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ticket_match JSONB;

-- Update climate preference options: replace prior constraint with new allowed set
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_profile' AND column_name = 'climate_preference'
  ) THEN
    BEGIN
      ALTER TABLE user_profile DROP CONSTRAINT IF EXISTS user_profile_climate_preference_check;
    EXCEPTION WHEN undefined_object THEN
      -- constraint name might differ on some instances; ignore
      NULL;
    END;
  END IF;
END $$;

ALTER TABLE user_profile
  ADD CONSTRAINT user_profile_climate_preference_check
  CHECK (climate_preference IS NULL OR climate_preference IN ('all','prefer_northerly','comfortable'));
