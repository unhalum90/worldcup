-- Migration 013: Address Supabase security lint findings
-- Date: 2025-05-12

-- Ensure the trip_plans compatibility view executes with the caller's privileges.
ALTER VIEW IF EXISTS trip_plans
  SET (security_invoker = true);

-- Enforce row level security on mailing_list and scope access to trusted contexts.
ALTER TABLE IF EXISTS mailing_list
  ENABLE ROW LEVEL SECURITY;

-- Keep the service role as the only actor with full access via policy for clarity.
DROP POLICY IF EXISTS "Service role can manage mailing list" ON mailing_list;

CREATE POLICY "Service role can manage mailing list" ON mailing_list
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
