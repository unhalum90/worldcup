-- Migration 017: Purchases table for Lemon Squeezy orders
-- Date: 2025-11-11

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- Lemon Squeezy identifiers
  ls_order_id TEXT UNIQUE,

  -- Product info
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,

  -- Pricing
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'completed',

  -- When purchased (defaults to now)
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Raw payload for audit/debugging (optional)
  payload JSONB
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(ls_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date DESC);

-- RLS to allow users to read their own purchases.
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow selecting rows where the authenticated user's id matches user_id
DROP POLICY IF EXISTS "purchases_select_by_user" ON purchases;
CREATE POLICY "purchases_select_by_user"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow selecting rows by email match (handles pre-login purchases)
-- Supabase exposes the user's email in the JWT at auth.jwt()->>'email'
DROP POLICY IF EXISTS "purchases_select_by_email" ON purchases;
CREATE POLICY "purchases_select_by_email"
  ON purchases
  FOR SELECT
  USING (email IS NOT NULL AND email = (auth.jwt() ->> 'email'));

COMMENT ON TABLE purchases IS 'User purchases synced from Lemon Squeezy webhooks.';
COMMENT ON COLUMN purchases.ls_order_id IS 'Lemon Squeezy order id for idempotency.';
COMMENT ON COLUMN purchases.payload IS 'Raw webhook payload for audit/debugging.';

