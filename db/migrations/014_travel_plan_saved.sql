-- Migration 014: Persist user-saved travel plans
-- Date: 2025-11-12

CREATE TABLE IF NOT EXISTS travel_plan_saved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_input JSONB,
  itinerary JSONB,
  selected_option_index INTEGER,
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_plan_saved_user ON travel_plan_saved(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plan_saved_created_at ON travel_plan_saved(created_at DESC);

ALTER TABLE travel_plan_saved ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "travel_plan_saved_select_own" ON travel_plan_saved;
CREATE POLICY "travel_plan_saved_select_own"
  ON travel_plan_saved
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "travel_plan_saved_insert_own" ON travel_plan_saved;
CREATE POLICY "travel_plan_saved_insert_own"
  ON travel_plan_saved
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "travel_plan_saved_update_own" ON travel_plan_saved;
CREATE POLICY "travel_plan_saved_update_own"
  ON travel_plan_saved
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "travel_plan_saved_delete_own" ON travel_plan_saved;
CREATE POLICY "travel_plan_saved_delete_own"
  ON travel_plan_saved
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_travel_plan_saved_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS travel_plan_saved_updated_at_trigger ON travel_plan_saved;
CREATE TRIGGER travel_plan_saved_updated_at_trigger
  BEFORE UPDATE ON travel_plan_saved
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_plan_saved_updated_at();

COMMENT ON TABLE travel_plan_saved IS 'Stores itineraries explicitly saved by users for later retrieval.';
COMMENT ON COLUMN travel_plan_saved.trip_input IS 'Original Trip Builder input payload used to generate the itinerary.';
COMMENT ON COLUMN travel_plan_saved.itinerary IS 'Generated itinerary JSON payload saved by the user.';
COMMENT ON COLUMN travel_plan_saved.selected_option_index IS 'The user-selected option index from the generated itinerary, if provided.';
