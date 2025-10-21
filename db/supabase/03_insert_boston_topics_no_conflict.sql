-- 03_insert_boston_topics_no_conflict.sql
-- Alternative: insert Boston topics without using ON CONFLICT

INSERT INTO topics (city_id, name, slug) VALUES
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Tickets', 'tickets'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Meetups', 'meetups'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Transportation', 'transportation'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Food & Dining', 'food-dining'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Accommodations', 'accommodations'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Match Schedule', 'match-schedule');

-- If you run this multiple times, you may get duplicate rows. Use the index file above to enable ON CONFLICT behavior.