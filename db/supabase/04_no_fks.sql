-- 04_no_fks.sql
-- Run this after 01,02,03. This file skips adding foreign key constraints and only enables RLS + policies + profile trigger.

-- Enable RLS for basic tables
ALTER TABLE IF EXISTS cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS topics ENABLE ROW LEVEL SECURITY;

-- Create simple public read policies (so your frontend can SELECT)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_cities') THEN
    EXECUTE 'CREATE POLICY public_select_cities ON cities FOR SELECT USING (true);';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_select_topics') THEN
    EXECUTE 'CREATE POLICY public_select_topics ON topics FOR SELECT USING (true);';
  END IF;
END$$;

-- Profiles: create simple insert trigger for auth.users (idempotent)
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

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
  END IF;
END$$;
