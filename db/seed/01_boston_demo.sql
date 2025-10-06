-- Seed: Boston demo city and starter threads/posts

-- Insert Boston city
INSERT INTO cities (id, name, slug, country, tz)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Boston', 'boston', 'US', 'America/New_York')
ON CONFLICT (slug) DO NOTHING;

-- Insert topics
INSERT INTO topics (city_id, name, slug)
VALUES
  ((SELECT id FROM cities WHERE slug='boston'), 'Tickets', 'tickets'),
  ((SELECT id FROM cities WHERE slug='boston'), 'Meetups', 'meetups'),
  ((SELECT id FROM cities WHERE slug='boston'), 'Transport & Transit', 'transport'),
  ((SELECT id FROM cities WHERE slug='boston'), 'Food & Bars', 'food-bars')
ON CONFLICT DO NOTHING;

-- Starter threads
INSERT INTO threads (id, city_id, author_id, title, body_md, topic)
VALUES
  (gen_random_uuid(), (SELECT id FROM cities WHERE slug='boston'), '00000000-0000-0000-0000-000000000100', 'Visa lottery tickets — experiences and tips', 'Share your experiences with visa lotteries and timelines.', 'tickets'),
  (gen_random_uuid(), (SELECT id FROM cities WHERE slug='boston'), '00000000-0000-0000-0000-000000000101', 'Best fan bars near Gillette/Logan?', 'Where do US and visiting fans gather before matches?', 'food-bars'),
  (gen_random_uuid(), (SELECT id FROM cities WHERE slug='boston'), '00000000-0000-0000-0000-000000000102', 'Transport from airport to stadium recommendations', 'Advice on trains, buses, and ride shares on matchdays.', 'transport')
ON CONFLICT DO NOTHING;

-- Sample posts
INSERT INTO posts (id, thread_id, author_id, body_md)
VALUES
  (gen_random_uuid(), (SELECT id FROM threads WHERE title ILIKE 'Visa lottery%'), '00000000-0000-0000-0000-000000000200', 'I had a good experience with the embassy...' ),
  (gen_random_uuid(), (SELECT id FROM threads WHERE title ILIKE 'Best fan bars%'), '00000000-0000-0000-0000-000000000201', 'Check out The Fanzone Pub on Atlantic Ave...' )
ON CONFLICT DO NOTHING;
