-- Migration: Create trip_sessions table for AI Travel Planner
-- Purpose: Store user trip context and AI-generated recommendations
-- Date: Oct 22, 2025

-- Create trip_sessions table
CREATE TABLE IF NOT EXISTS trip_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core trip data
  trip_context JSONB NOT NULL,          -- Base overview: dates, cities, preferences
  flights_data JSONB,                   -- Flight recommendations
  lodging_data JSONB,                   -- Lodging recommendations
  ground_data JSONB,                    -- Ground transport (future phase)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_sessions_user_id 
  ON trip_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_sessions_updated_at 
  ON trip_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_trip_sessions_created_at 
  ON trip_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE trip_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own sessions
CREATE POLICY "Users can view their own trip sessions"
  ON trip_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trip sessions"
  ON trip_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip sessions"
  ON trip_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip sessions"
  ON trip_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trip_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER trip_sessions_updated_at_trigger
  BEFORE UPDATE ON trip_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_sessions_updated_at();

-- Add comment to table
COMMENT ON TABLE trip_sessions IS 'Stores user trip planning sessions with AI-generated recommendations';
COMMENT ON COLUMN trip_sessions.trip_context IS 'Base trip details: dates, cities, team preferences, budget';
COMMENT ON COLUMN trip_sessions.flights_data IS 'AI-generated flight recommendations and routing';
COMMENT ON COLUMN trip_sessions.lodging_data IS 'AI-generated lodging suggestions by area';
COMMENT ON COLUMN trip_sessions.ground_data IS 'AI-generated ground transport and fan fest guidance';
