-- Migration 015: Link mailing_list rows to users and enforce uniqueness
-- Date: 2025-11-29

-- 1) Normalize existing email values (trim & lowercase) to prepare for unique constraint.
UPDATE mailing_list
SET email = lower(trim(email))
WHERE email IS NOT NULL;

-- 2) Remove duplicate rows keeping the most recent entry per email.
WITH ranked AS (
  SELECT
    id,
    email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, id DESC) AS rn
  FROM mailing_list
)
DELETE FROM mailing_list
USING ranked
WHERE mailing_list.id = ranked.id
  AND ranked.rn > 1;

-- 3) Add user linkage + MailerLite tracking columns if they do not already exist.
ALTER TABLE mailing_list
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS mailerlite_id text;

-- 4) Ensure tags/metadata have sensible defaults.
UPDATE mailing_list
SET tags = COALESCE(tags, '[]'::jsonb),
    metadata = COALESCE(metadata, '{}'::jsonb);

-- 5) Enforce email uniqueness.
DO $$
BEGIN
  ALTER TABLE mailing_list
    ADD CONSTRAINT mailing_list_email_unique UNIQUE (email);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- 6) Create an index to accelerate lookups by user_id.
CREATE INDEX IF NOT EXISTS idx_mailing_list_user_id ON mailing_list(user_id);
