-- Migration 019: Profiles membership hotfix (idempotent, non-destructive)
-- Purpose: Avoid dropping PK; ensure profiles has required columns, indexes, RLS, and triggers
-- Date: 2025-11-12

-- 1) Columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS account_level text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_member boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Backfill user_id from id if needed
DO $$
DECLARE has_id boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) INTO has_id;
  IF has_id THEN
    EXECUTE 'UPDATE profiles SET user_id = COALESCE(user_id, id) WHERE user_id IS NULL';
  END IF;
END $$;

-- 3) Guarantee uniqueness on user_id (do not alter existing PK)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON profiles(user_id);

-- 4) Unique lower(email) when present
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique ON profiles (lower(email)) WHERE email IS NOT NULL;

-- 5) updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6) RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR (email IS NOT NULL AND email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 7) Auto-provision trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

COMMENT ON FUNCTION public.handle_new_user IS 'Create or sync public.profiles row when a new auth user is created.';
