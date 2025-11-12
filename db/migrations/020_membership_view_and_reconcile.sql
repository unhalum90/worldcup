-- Migration 020: Derived view and login-time reconciliation
-- Date: 2025-11-12

-- 1) Purchases: add optional Lemon identifiers
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS ls_customer_id text,
  ADD COLUMN IF NOT EXISTS ls_variant_id text;

CREATE INDEX IF NOT EXISTS purchases_email_lower_idx ON purchases (lower(email));

-- 2) Active members convenience view
CREATE OR REPLACE VIEW public.active_members AS
SELECT
  p.user_id,
  p.email,
  COALESCE(p.is_member, false) AS is_member,
  p.account_level,
  p.subscription_status,
  p.subscription_renews_at,
  p.subscription_cancels_at
FROM public.profiles p
WHERE
  COALESCE(p.is_member, false) = true
  AND (p.subscription_cancels_at IS NULL OR p.subscription_cancels_at > now());

-- 3) Function to attach orphan purchases to a user at login
CREATE OR REPLACE FUNCTION public.attach_purchases_to_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL THEN
    RETURN;
  END IF;
  -- Attach purchases by email
  UPDATE public.purchases
     SET user_id = p_user_id
   WHERE user_id IS NULL AND lower(email) = lower(v_email);

  -- Ensure profile row has email set
  UPDATE public.profiles
     SET email = v_email
   WHERE user_id = p_user_id AND (email IS NULL OR email = '');
END;
$$;

GRANT EXECUTE ON FUNCTION public.attach_purchases_to_user(uuid) TO authenticated;

