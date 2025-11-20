-- Migration 018: Harden profiles for membership + auto-provision from auth.users
-- Date: 2025-11-12

-- Ensure required columns exist on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS account_level text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_member boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill user_id with the existing `id` column if present
DO $$
DECLARE has_id boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
  ) INTO has_id;

  IF has_id THEN
    EXECUTE 'UPDATE profiles SET user_id = COALESCE(user_id, id) WHERE user_id IS NULL';
  END IF;
END $$;

-- Ensure profiles has a stable unique identifier without breaking existing FKs
DO $$
DECLARE pk_on_user_id boolean;
DECLARE has_pk boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conrelid = 'public.profiles'::regclass AND c.contype = 'p'
  ) INTO has_pk;

  -- Detect if current PK already includes user_id
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ord) ON TRUE
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = cols.attnum
    WHERE c.conrelid = 'public.profiles'::regclass
      AND c.contype = 'p'
      AND a.attname = 'user_id'
  ) INTO pk_on_user_id;

  IF NOT has_pk THEN
    -- No PK yet; safe to add on user_id
    ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);
  ELSIF NOT pk_on_user_id THEN
    -- PK exists on a different column; do NOT drop (other FKs may depend). Ensure user_id is unique for upserts.
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON profiles(user_id);
  END IF;
END $$;

-- Unique index on lower(email) when present
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique ON profiles (lower(email)) WHERE email IS NOT NULL;

-- Keep updated_at fresh
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

-- RLS: allow users to read and modify their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Auto-provision a profile row for each new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Create or sync public.profiles row when a new auth user is created.';
