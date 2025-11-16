-- TEMPORARY TEST SEED: user profiles, purchases, and mailing_list for internal testing
-- NOTE: Remove after internal QA, or wrap in a reversible migration.

-- 1) Ensure test profiles exist and have email + membership state
INSERT INTO profiles (user_id, email, role, account_level, subscription_tier, subscription_status, created_at)
VALUES
  ('6871a597-4c5e-43b3-a3c9-42e956e3b343', 'echamberlin@me.com', 'user', 'member', 'premium', 'active', now()),
  ('a5974b16-ade2-4721-a0ba-67cf48eab0cc', 'worldcup26fanzone@gmail.com', 'user', 'city_bundle', 'free', 'active', now()),
  ('d502aed4-47f0-46f9-8a72-2bdebe74d748', 'eric@xrtoolsfored.com', 'user', 'free', 'free', 'active', now())
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  account_level = EXCLUDED.account_level,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status;

-- 2) Seed purchases with different scenarios
-- Member purchase for echamberlin@me.com
INSERT INTO purchases (user_id, email, product_id, product_name, price, currency, status, ls_order_id, purchase_date)
VALUES (
  '6871a597-4c5e-43b3-a3c9-42e956e3b343',
  'echamberlin@me.com',
  'member-annual-001',
  'WC26 Membership (Annual)',
  2999/100.0,
  'USD',
  'completed',
  'LS-TEST-0001',
  now() - interval '10 days'
)
ON CONFLICT (ls_order_id) DO NOTHING;

-- City bundle for worldcup26fanzone@gmail.com (completed + refunded example)
INSERT INTO purchases (user_id, email, product_id, product_name, price, currency, status, ls_order_id, purchase_date)
VALUES (
  'a5974b16-ade2-4721-a0ba-67cf48eab0cc',
  'worldcup26fanzone@gmail.com',
  'bundle-4city-001',
  '4-City Bundle (Dallas, Atlanta, LA, Vancouver)',
  999/100.0,
  'USD',
  'completed',
  'LS-TEST-0002',
  now() - interval '7 days'
)
ON CONFLICT (ls_order_id) DO NOTHING;

INSERT INTO purchases (user_id, email, product_id, product_name, price, currency, status, ls_order_id, purchase_date)
VALUES (
  'a5974b16-ade2-4721-a0ba-67cf48eab0cc',
  'worldcup26fanzone@gmail.com',
  'bundle-2city-002',
  '2-City Bundle (NYC, Boston)',
  499/100.0,
  'USD',
  'refunded',
  'LS-TEST-0003',
  now() - interval '3 days'
)
ON CONFLICT (ls_order_id) DO NOTHING;

-- PDF purchase for eric@xrtoolsfored.com left without user_id to test email-based fallback
INSERT INTO purchases (user_id, email, product_id, product_name, price, currency, status, ls_order_id, purchase_date)
VALUES (
  NULL,
  'eric@xrtoolsfored.com',
  'pdf-city-dal-001',
  'Dallas City Guide (PDF)',
  0,
  'USD',
  'completed',
  'LS-TEST-0004',
  now() - interval '1 day'
)
ON CONFLICT (ls_order_id) DO NOTHING;

-- 3) Newsletter: seed into mailing_list
-- Insert if missing
INSERT INTO mailing_list (email, confirmed, source, tags)
SELECT v.email, v.confirmed, v.source, v.tags
FROM (
  VALUES
    ('echamberlin@me.com', true, 'seed', '["newsletter","member"]'::jsonb),
    ('worldcup26fanzone@gmail.com', true, 'seed', '["newsletter","bundle"]'::jsonb),
    ('eric@xrtoolsfored.com', false, 'seed', '["newsletter"]'::jsonb)
) AS v(email, confirmed, source, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM mailing_list m WHERE m.email = v.email
);

-- Update to desired state
UPDATE mailing_list m SET
  confirmed = v.confirmed,
  tags = v.tags
FROM (
  VALUES
    ('echamberlin@me.com', true, '["newsletter","member"]'::jsonb),
    ('worldcup26fanzone@gmail.com', true, '["newsletter","bundle"]'::jsonb),
    ('eric@xrtoolsfored.com', false, '["newsletter"]'::jsonb)
) AS v(email, confirmed, tags)
WHERE m.email = v.email;
