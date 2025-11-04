-- Migration 016: Admin analytics overview view
-- Date: 2025-11-30

DROP VIEW IF EXISTS analytics_overview;

CREATE VIEW analytics_overview AS
SELECT
  CURRENT_DATE::date AS report_date,
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM auth.users WHERE created_at >= now() - INTERVAL '1 day') AS new_users_24h,
  (SELECT COUNT(*) FROM travel_plans) AS total_trip_plans,
  (SELECT COUNT(*) FROM travel_plans WHERE created_at >= now() - INTERVAL '1 day') AS trip_plans_24h,
  (SELECT COUNT(*) FROM trip_sessions WHERE flights_data IS NOT NULL) AS flight_plans_total,
  (SELECT COUNT(*) FROM trip_sessions WHERE flights_data IS NOT NULL AND created_at >= now() - INTERVAL '1 day') AS flight_plans_24h,
  (SELECT COUNT(*) FROM lodging_plans) AS lodging_plans_total,
  (SELECT COUNT(*) FROM lodging_plans WHERE created_at >= now() - INTERVAL '1 day') AS lodging_plans_24h;

ALTER VIEW analytics_overview SET (security_invoker = false);
