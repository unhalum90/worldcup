-- Migration 007: User Settings — extend profiles and add purchases
-- Run with service role (or Supabase SQL editor)

-- This migration is obsolete and has been superseded by 021_drop_legacy_membership_columns.sql


-- Optional: backfill email from auth.users if available (requires service role)
-- NOTE: Supabase REST cannot query auth schema with anon key; run in SQL editor or via admin API.
-- UPDATE profiles p
-- SET email = au.email
-- FROM auth.users au
-- WHERE p.user_id = au.id AND p.email IS NULL;

-- 2) Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  email TEXT,
  product_id TEXT,
  product_name TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','refunded','failed','void')),
  ls_order_id TEXT UNIQUE,
  payload JSONB DEFAULT '{}'::jsonb,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_purchases_ls_order_id ON purchases(ls_order_id);

-- 3) RLS for purchases: users can read their own; writes via service role/webhook
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS purchases_select_own ON purchases;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY purchases_select_own ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- We omit INSERT/UPDATE/DELETE policies so only service role can write.

-- 4) Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON purchases;
CREATE TRIGGER trg_purchases_updated_at
BEFORE UPDATE ON purchases
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
