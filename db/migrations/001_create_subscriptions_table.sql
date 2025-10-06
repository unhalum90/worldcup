-- Migration: create mailing_list (subscriptions) table

CREATE TABLE IF NOT EXISTS mailing_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text,
  tags jsonb DEFAULT '[]',
  confirmed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list (email);
