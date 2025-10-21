-- Complete Supabase Setup for World Cup Forums
-- Copy and paste this entire file into Supabase SQL Editor

-- 1. Create all tables
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(2) NOT NULL,
  tz VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  body TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id),
  CHECK ((thread_id IS NULL) != (post_id IS NULL))
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((thread_id IS NULL) != (post_id IS NULL))
);

CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  mailerlite_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Cities and topics are public (read-only)
CREATE POLICY "Cities are viewable by authenticated users" ON cities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Topics are viewable by authenticated users" ON topics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles
CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Threads
CREATE POLICY "Threads are viewable by authenticated users" ON threads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own threads" ON threads
  FOR UPDATE USING (auth.uid() = author_id);

-- Posts
CREATE POLICY "Posts are viewable by authenticated users" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Votes
CREATE POLICY "Votes are viewable by authenticated users" ON votes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own votes" ON votes
  FOR ALL USING (auth.uid() = user_id);

-- Reports (admin-focused, simplified for now)
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id);

-- Mailing list (service role access)
CREATE POLICY "Service role can manage mailing list" ON mailing_list
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Insert all 16 host cities
INSERT INTO cities (id, name, slug, country, tz)
VALUES
  ('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Boston', 'boston', 'US', 'America/New_York'),
  ('1fd93f79-35f3-4df6-8350-03f47e3002d7', 'Atlanta', 'atlanta', 'US', 'America/New_York'),
  ('2fd93f79-35f3-4df6-8350-03f47e3002d8', 'Dallas', 'dallas', 'US', 'America/Chicago'),
  ('3fd93f79-35f3-4df6-8350-03f47e3002d9', 'Guadalajara', 'guadalajara', 'MX', 'America/Mexico_City'),
  ('4fd93f79-35f3-4df6-8350-03f47e3002da', 'Houston', 'houston', 'US', 'America/Chicago'),
  ('5fd93f79-35f3-4df6-8350-03f47e3002db', 'Kansas City', 'kansas-city', 'US', 'America/Chicago'),
  ('6fd93f79-35f3-4df6-8350-03f47e3002dc', 'Los Angeles', 'los-angeles', 'US', 'America/Los_Angeles'),
  ('7fd93f79-35f3-4df6-8350-03f47e3002dd', 'Mexico City', 'mexico-city', 'MX', 'America/Mexico_City'),
  ('8fd93f79-35f3-4df6-8350-03f47e3002de', 'Miami', 'miami', 'US', 'America/New_York'),
  ('9fd93f79-35f3-4df6-8350-03f47e3002df', 'Monterrey', 'monterrey', 'MX', 'America/Mexico_City'),
  ('afd93f79-35f3-4df6-8350-03f47e3002d0', 'New York', 'new-york', 'US', 'America/New_York'),
  ('bfd93f79-35f3-4df6-8350-03f47e3002d1', 'Philadelphia', 'philadelphia', 'US', 'America/New_York'),
  ('cfd93f79-35f3-4df6-8350-03f47e3002d2', 'San Francisco', 'san-francisco', 'US', 'America/Los_Angeles'),
  ('dfd93f79-35f3-4df6-8350-03f47e3002d3', 'Seattle', 'seattle', 'US', 'America/Los_Angeles'),
  ('efd93f79-35f3-4df6-8350-03f47e3002d4', 'Toronto', 'toronto', 'CA', 'America/Toronto'),
  ('ffd93f79-35f3-4df6-8350-03f47e3002d5', 'Vancouver', 'vancouver', 'CA', 'America/Vancouver')
ON CONFLICT (slug) DO NOTHING;

-- 5. Insert topics for Boston only (for testing)
INSERT INTO topics (city_id, name, slug) VALUES 
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Tickets', 'tickets'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Meetups', 'meetups'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Transportation', 'transportation'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Food & Dining', 'food-dining'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Accommodations', 'accommodations'),
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Match Schedule', 'match-schedule')
ON CONFLICT (city_id, slug) DO NOTHING;

-- 6. Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();