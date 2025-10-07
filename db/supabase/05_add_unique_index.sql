-- 05_add_unique_index.sql
-- Run this in Supabase before re-running the topics insert.
-- This creates a UNIQUE index that ON CONFLICT can use.

CREATE UNIQUE INDEX IF NOT EXISTS topics_city_slug_idx ON topics (city_id, slug);

-- Verify constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'topics';

-- After running this, re-run 03_insert_boston_topics.sql (or the insert SQL below).