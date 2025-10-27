-- Migration 012: Lodging Planner persistence
-- Date: 2025-10-26

CREATE TABLE IF NOT EXISTS lodging_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES travel_plans(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  preferences JSONB,
  zoning JSONB,
  summary_md TEXT,
  prompt_payload JSONB,
  model_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lodging_plans_user ON lodging_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lodging_plans_city ON lodging_plans(city);

ALTER TABLE lodging_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lodging_plans_select_own" ON lodging_plans;
CREATE POLICY "lodging_plans_select_own"
  ON lodging_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lodging_plans_insert_own" ON lodging_plans;
CREATE POLICY "lodging_plans_insert_own"
  ON lodging_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lodging_plans_update_own" ON lodging_plans;
CREATE POLICY "lodging_plans_update_own"
  ON lodging_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
