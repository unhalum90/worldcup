-- Migration: Add subscription tier to profiles
-- Purpose: Future-proof for paid subscriptions with Lemon Squeezy

-- Add subscription_tier column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'premium', 'pro'));

-- Add index for tier queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Update existing profiles to have 'free' tier
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- Add subscription metadata for future use
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Comment for future reference
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription level: free (default), premium, pro';
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status for paid users';
