-- MANUAL FIX: Update your membership status for the purchases that failed to process
-- Run this in Supabase SQL Editor to immediately grant membership access

-- Fix for eric@ericchamberlin.tech purchase (Order: 6830718, User ID: 34ac70a2-82d6-4673-9165-29d8895d3373)
UPDATE profiles 
SET 
  account_level = 'member',
  subscription_tier = 'premium',
  subscription_status = 'active',
  is_member = true,
  updated_at = NOW()
WHERE user_id = '34ac70a2-82d6-4673-9165-29d8895d3373';

-- Insert the purchase record
INSERT INTO purchases (
  user_id,
  ls_order_id,
  email,
  product_id,
  product_name,
  price,
  currency,
  status,
  payload
) VALUES (
  '34ac70a2-82d6-4673-9165-29d8895d3373',
  '6830718',
  'eric@ericchamberlin.tech',
  '688338',
  'World Cup 26 Fan Zone Membership',
  0.00,
  'EUR',
  'completed',
  '{"manual_fix": true, "reason": "webhook_blocked_by_vercel_bot_protection"}'::jsonb
)
ON CONFLICT (ls_order_id) DO UPDATE SET
  status = 'completed',
  updated_at = NOW();

-- Fix for saltyjim2324@gmail.com if they also purchased (check your first test)
-- UPDATE profiles 
-- SET 
--   account_level = 'member',
--   subscription_tier = 'premium',
--   subscription_status = 'active',
--   is_member = true,
--   updated_at = NOW()
-- WHERE email = 'saltyjim2324@gmail.com';

-- Verify the updates
SELECT 
  user_id,
  email,
  account_level,
  subscription_tier,
  is_member,
  updated_at
FROM profiles 
WHERE user_id IN ('34ac70a2-82d6-4673-9165-29d8895d3373', '6495f622-e8ad-420d-b448-79fdb5fa3642');

SELECT * FROM purchases WHERE user_id = '34ac70a2-82d6-4673-9165-29d8895d3373';
