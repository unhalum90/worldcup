-- Add new logistics-focused fields to match_pages
-- Run this after the initial match_pages table creation

ALTER TABLE public.match_pages 
ADD COLUMN IF NOT EXISTS head_to_head jsonb DEFAULT '{"team1_wins": 0, "team2_wins": 0, "draws": 0, "last_meeting": null}'::jsonb,
ADD COLUMN IF NOT EXISTS team1_wc_appearances integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team2_wc_appearances integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team1_fan_culture text,
ADD COLUMN IF NOT EXISTS team2_fan_culture text,
ADD COLUMN IF NOT EXISTS team1_staple_food text,
ADD COLUMN IF NOT EXISTS team2_staple_food text,
ADD COLUMN IF NOT EXISTS getting_to_stadium text,
ADD COLUMN IF NOT EXISTS fan_festival_info text,
ADD COLUMN IF NOT EXISTS venue_history text,
ADD COLUMN IF NOT EXISTS team1_visa_info text,
ADD COLUMN IF NOT EXISTS team2_visa_info text,
ADD COLUMN IF NOT EXISTS team1_avg_flight_budget text,
ADD COLUMN IF NOT EXISTS team2_avg_flight_budget text;

-- Remove the old storyline fields (optional - can keep for backwards compat)
-- ALTER TABLE public.match_pages DROP COLUMN IF EXISTS team1_storyline;
-- ALTER TABLE public.match_pages DROP COLUMN IF EXISTS team2_storyline;
-- ALTER TABLE public.match_pages DROP COLUMN IF EXISTS rivalry_context;

COMMENT ON COLUMN public.match_pages.head_to_head IS 'JSON: {team1_wins, team2_wins, draws, last_meeting}';
COMMENT ON COLUMN public.match_pages.getting_to_stadium IS 'Transport recommendations from city guide';
COMMENT ON COLUMN public.match_pages.fan_festival_info IS 'Fan fest location and capacity';
COMMENT ON COLUMN public.match_pages.venue_history IS 'Historic venue facts';
