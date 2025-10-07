-- 04_profiles_and_rls.sql
-- Run this after previous steps once basic inserts succeed

-- (idempotent) Add missing columns and foreign keys only if they don't exist
DO $$
BEGIN
  -- Add topic_id column to threads if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'topic_id'
  ) THEN
    ALTER TABLE threads ADD COLUMN topic_id UUID;
  END IF;

  -- Add FK: topics.city_id -> cities.id (if not present)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_topics_city'
  ) THEN
    ALTER TABLE topics
      ADD CONSTRAINT fk_topics_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;
  END IF;

  -- Add FK: threads.city_id -> cities.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_threads_city'
  ) THEN
    ALTER TABLE threads
      ADD CONSTRAINT fk_threads_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;
  END IF;

  -- Add FK: threads.topic_id -> topics.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_threads_topic'
  ) THEN
    ALTER TABLE threads
      ADD CONSTRAINT fk_threads_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
  END IF;

  -- Add FK: posts.thread_id -> threads.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_posts_thread'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT fk_posts_thread FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Create RLS and policies (minimal: allow public read for now)
ALTER TABLE IF EXISTS cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS topics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_cities') THEN
    EXECUTE 'CREATE POLICY public_select_cities ON cities FOR SELECT USING (true);';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_topics') THEN
    EXECUTE 'CREATE POLICY public_select_topics ON topics FOR SELECT USING (true);';
  END IF;
END$$;

-- Profiles: create simple insert trigger for auth.users if using Supabase auth later
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (won't fail if auth.users doesn't exist in this testing environment)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
      PERFORM 1;
    ELSE
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
  END IF;
END $$;
