-- Migration to drop legacy membership columns

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS account_level,
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS subscription_status;

-- Note: The column is_member is intentionally KEPT and will be managed by the new webhook.
