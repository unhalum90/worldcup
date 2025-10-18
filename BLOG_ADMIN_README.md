# Blog Admin Console - Setup Instructions

This is the AI-powered blog admin console for World Cup 2026 content generation.

## Features

✅ **Sprint 1: Authentication & Dashboard**
- Supabase authentication (email + Google OAuth)
- Admin dashboard with post statistics
- Protected admin routes

✅ **Sprint 2: Database Schema**
- `blog_posts` table with full metadata
- `keywords` table for SEO research
- Row-level security (RLS) policies
- Auto-generated slugs and timestamps

✅ **Sprint 3: Keyword Research Tool**
- AI-powered keyword generation using OpenAI GPT-4
- City-specific keyword targeting
- Save keywords to database for reuse

✅ **Sprint 4: AI Article Generator**
- Generate full blog posts from topics/keywords
- Automatic outline creation
- 1200-1800 word articles in Markdown
- City-specific content targeting

✅ **Sprint 5: Content Management**
- Draft editor with Markdown support
- Tagging system (city, custom tags, SEO keywords)
- Meta description and excerpt fields
- One-click publishing
- Public blog post rendering

## Setup

### 1. Install Dependencies

```bash
cd web
npm install
```

**Key packages:**
- `openai` - OpenAI GPT-4 API
- `react-markdown` - Render Markdown in blog posts
- `@supabase/supabase-js` - Database and authentication

### 2. Environment Variables

Create a `.env.local` file in the `web/` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

Run the migration script in your Supabase SQL editor:

```bash
# Located at: db/migrations/004_blog_admin_schema.sql
```

This creates:
- `blog_posts` table
- `keywords` table
- RLS policies
- Auto-slug generation triggers
- Storage bucket for blog images (optional)

### 4. Create Admin User

After signing up, manually set your user as admin in Supabase:

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id';
```

Get your user ID from the `auth.users` table or from the Supabase dashboard.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login` to access the admin console.

## Usage Workflow

### 1. Research Keywords
- Go to **Keyword Research** (`/admin/keywords`)
- Enter a seed topic (e.g., "best hotels", "top restaurants")
- Select target city (optional)
- Click "Generate Keywords" to get 15-20 AI-generated SEO keywords
- Save keywords to database for future reference

### 2. Generate Article
- Go to **Generate Article** (`/admin/generate`)
- Enter topic or select from saved keywords
- Choose target city
- (Optional) Add reference URL for style matching
- Click "Generate Article"
- Review AI-generated title, outline, and Markdown content
- Click "Save Draft" to store in database

### 3. Edit & Publish
- Go to **Drafts & Editor** (`/admin/drafts`)
- Click on a draft to open the editor
- Edit Markdown content
- Add tags, SEO keywords, meta description
- Set featured image URL
- Preview formatting
- Click "Publish" to make live

### 4. View Published
- Go to **Published Posts** (`/admin/published`)
- See all live articles
- Click "View" to see public page
- Public URL: `/blog/{slug}`

## File Structure

```
web/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin dashboard shell
│   │   ├── page.tsx             # Dashboard home
│   │   ├── login/
│   │   │   └── page.tsx         # Admin login
│   │   ├── keywords/
│   │   │   └── page.tsx         # Keyword research tool
│   │   ├── generate/
│   │   │   └── page.tsx         # AI article generator
│   │   ├── drafts/
│   │   │   ├── page.tsx         # Drafts list
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Draft editor
│   │   └── published/
│   │       └── page.tsx         # Published posts list
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx         # Public blog post view
│   └── api/
│       └── admin/
│           ├── keywords/
│           │   └── route.ts     # OpenAI keyword generation
│           └── generate-article/
│               └── route.ts     # OpenAI article generation
└── db/
    └── migrations/
        └── 004_blog_admin_schema.sql
```

## API Routes

### POST `/api/admin/keywords`
Generate SEO keywords using OpenAI GPT-4.

**Body:**
```json
{
  "seedTopic": "best hotels",
  "city": "Boston" // optional
}
```

**Response:**
```json
{
  "keywords": ["boston world cup 2026 hotels", ...],
  "seedTopic": "best hotels",
  "city": "Boston"
}
```

### POST `/api/admin/generate-article`
Generate full blog post using OpenAI GPT-4.

**Body:**
```json
{
  "topic": "top restaurants in dallas",
  "city": "Dallas", // optional
  "referenceUrl": "https://..." // optional
}
```

**Response:**
```json
{
  "title": "Top 10 Restaurants in Dallas for World Cup 2026",
  "outline": "...",
  "content": "## Introduction\n\n...",
  "topic": "top restaurants in dallas",
  "city": "Dallas"
}
```

## Database Schema

### `blog_posts`
- `id` (UUID, primary key)
- `title` (text)
- `slug` (text, unique, auto-generated)
- `status` (draft | published | archived)
- `content_markdown` (text)
- `excerpt` (text)
- `city` (text)
- `tags` (text[])
- `seo_keywords` (text[])
- `meta_description` (text)
- `author_id` (UUID, FK to auth.users)
- `published_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `keywords`
- `id` (UUID, primary key)
- `keyword` (text)
- `city` (text)
- `search_volume` (integer)
- `competition` (text)
- `source` (openai | google | manual)
- `used_in_post_id` (UUID, FK to blog_posts)
- `created_at` (timestamp)
- `created_by` (UUID, FK to auth.users)

## Security

- **RLS Policies:** Only admins can create/edit posts
- **Public Read:** Anyone can read published posts
- **Admin Role:** Stored in `profiles.role` column
- **Auth Required:** All admin routes check authentication

## Customization

### Change AI Model
Edit `web/app/api/admin/generate-article/route.ts`:
```typescript
model: 'gpt-4', // Change to 'gpt-3.5-turbo' for faster/cheaper
```

### Adjust Content Length
Edit the prompt in `generate-article/route.ts`:
```typescript
// Change from "1200-1800 words" to your preferred length
```

### Add More Cities
Edit `WORLD_CUP_CITIES` array in:
- `web/app/admin/keywords/page.tsx`
- `web/app/admin/generate/page.tsx`
- `web/app/admin/drafts/[id]/page.tsx`

## Troubleshooting

### "Cannot find module 'openai'"
```bash
npm install openai
```

### "Cannot find module 'react-markdown'"
```bash
npm install react-markdown
```

### "User not authorized"
Make sure you set `role = 'admin'` in the profiles table.

### OpenAI API errors
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Verify API key has credits
- Check rate limits

### Supabase RLS errors
- Run the migration script `004_blog_admin_schema.sql`
- Verify RLS policies are enabled
- Check user has admin role

## Next Steps

1. **Image Upload:** Integrate Supabase Storage for featured images
2. **Rich Editor:** Replace textarea with TipTap or SimpleMDE
3. **SEO Optimization:** Auto-generate meta tags
4. **Analytics:** Track post views and engagement
5. **Scheduled Publishing:** Auto-publish at specific dates
6. **Content Calendar:** Visual planning tool

## Support

For issues or questions, check:
- Supabase docs: https://supabase.com/docs
- OpenAI docs: https://platform.openai.com/docs
- Next.js docs: https://nextjs.org/docs
