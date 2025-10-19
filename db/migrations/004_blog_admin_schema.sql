-- Migration: Blog Admin Console Database Schema
-- Created: 2025-10-18
-- Purpose: Support AI content generation, draft management, and blog publishing

-- ========================================
-- 1. Create blog_posts table
-- ========================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Content
  content_markdown TEXT,
  excerpt TEXT,
  
  -- Categorization
  city TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- SEO
  seo_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  meta_description TEXT,
  
  -- Authorship
  author_id UUID REFERENCES auth.users(id),
  
  -- Publishing
  published_at TIMESTAMPTZ,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  featured_image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Index for status + published_at (for listing published posts)
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC);

-- Index for city filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_city ON blog_posts(city);

-- Index for tags (GIN index for array searches)
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);


-- ========================================
-- 2. Create keywords table
-- ========================================
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  city TEXT,
  search_volume INTEGER,
  competition TEXT, -- 'low', 'medium', 'high'
  source TEXT, -- 'openai', 'google', 'manual'
  used_in_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index for keyword lookups
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_city ON keywords(city);
CREATE INDEX IF NOT EXISTS idx_keywords_created_at ON keywords(created_at DESC);


-- ========================================
-- 3. Update profiles table (add role column if not exists)
-- ========================================
-- Note: profiles table already has 'role' column from migration 003
-- This section is kept for reference but won't execute since role exists


-- ========================================
-- 4. Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins have full access to blog posts"
  ON blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS on keywords
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Only admins can access keywords
CREATE POLICY "Only admins can access keywords"
  ON keywords
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ========================================
-- 5. Functions & Triggers
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS generate_blog_post_slug ON blog_posts;
CREATE TRIGGER generate_blog_post_slug
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();


-- ========================================
-- 6. Storage bucket for blog images
-- ========================================
-- Note: Run this in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('blog-images', 'blog-images', true);


-- ========================================
-- 7. Sample data (optional - for testing)
-- ========================================
-- Uncomment to insert sample admin user and test post
/*
-- Make sure to replace 'your-user-id' with actual user UUID from auth.users
UPDATE profiles SET role = 'admin' WHERE user_id = 'your-user-id';

INSERT INTO blog_posts (title, slug, status, content_markdown, city, tags, seo_keywords, meta_description, author_id)
VALUES (
  'Top 5 Neighborhoods to Stay in Dallas for World Cup 2026',
  'top-5-neighborhoods-dallas-world-cup',
  'draft',
  '# Top 5 Neighborhoods to Stay in Dallas\n\nPlanning your World Cup trip? Here are the best areas...',
  'dallas',
  ARRAY['dallas', 'accommodation', 'travel-tips'],
  ARRAY['dallas world cup hotels', 'where to stay dallas 2026', 'world cup accommodation'],
  'Discover the best neighborhoods to stay in Dallas during the 2026 World Cup. Expert tips on location, transport, and atmosphere.',
  'your-user-id'
);
*/
