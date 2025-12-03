# Fix Blog Post Slugs

## Issue
Blog posts with slashes in slugs (e.g., `/groups/group-a-mexico-travel-guide`) return 404 because Next.js treats slashes as path separators.

## Solution
Run this SQL in your Supabase SQL Editor to fix all existing posts with slashes in their slugs:

```sql
-- Fix slugs that contain slashes
UPDATE blog_posts 
SET slug = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(slug, '/', '-', 'g'),  -- Replace slashes with hyphens
    '[^a-z0-9-]', '-', 'g'                -- Remove invalid characters
  ),
  '-+', '-', 'g'                          -- Collapse multiple hyphens
)
WHERE slug LIKE '%/%';

-- View the updated posts
SELECT id, title, slug, status 
FROM blog_posts 
WHERE status = 'published' 
ORDER BY published_at DESC;
```

## Specific Fix for Your Post
If you want to fix just the specific post:

```sql
UPDATE blog_posts 
SET slug = 'group-a-mexico-travel-guide'
WHERE slug = '/groups/group-a-mexico-travel-guide' 
   OR slug = 'groups/group-a-mexico-travel-guide';

-- Verify
SELECT title, slug FROM blog_posts WHERE title LIKE '%Group A%';
```

## After Running SQL
Your post will be accessible at:
- ✅ `https://worldcup26fanzone.com/blog/group-a-mexico-travel-guide`
- ❌ `https://worldcup26fanzone.com/blog/groups/group-a-mexico-travel-guide` (404)

## Changes Made to Prevent This
The blog editor now automatically:
1. Strips ALL slashes from slugs
2. Converts them to hyphens
3. Removes invalid characters
4. Prevents entering slashes
5. Shows warning: "⚠️ No slashes allowed - they'll be converted to hyphens"
