-- Match Pages CMS table for 72 group stage matches
-- Similar to blog_posts but tailored for match content

create table if not exists public.match_pages (
  id uuid default gen_random_uuid() primary key,
  match_number integer not null unique check (match_number >= 1 and match_number <= 72),
  slug text not null unique, -- e.g., "mexico-vs-south-africa"
  status text not null default 'draft' check (status in ('draft', 'published')),
  
  -- Match metadata (cached from matchesData for convenience)
  team1 text not null,
  team2 text not null,
  match_date text not null,
  match_time text not null,
  city text not null,
  stadium text not null,
  
  -- Editable content sections
  youtube_url text,
  team1_storyline text, -- markdown
  team2_storyline text, -- markdown
  rivalry_context text, -- markdown
  fan_experience text, -- markdown
  infographic_url text, -- uploaded image URL
  map_embed_url text, -- Google Maps embed URL
  
  -- Reddit quotes as JSON array: [{quote, username, subreddit}]
  reddit_quotes jsonb default '[]'::jsonb,
  
  -- SEO fields
  seo_title text, -- auto-generated but editable
  seo_description text,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Index for fast lookups
create index if not exists idx_match_pages_slug on public.match_pages(slug);
create index if not exists idx_match_pages_status on public.match_pages(status);
create index if not exists idx_match_pages_city on public.match_pages(city);
create index if not exists idx_match_pages_team1 on public.match_pages(team1);
create index if not exists idx_match_pages_team2 on public.match_pages(team2);

-- Updated_at trigger
create or replace function update_match_pages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists match_pages_updated_at on public.match_pages;
create trigger match_pages_updated_at
  before update on public.match_pages
  for each row
  execute function update_match_pages_updated_at();

-- Enable RLS
alter table public.match_pages enable row level security;

-- Policy: Anyone can read published match pages
create policy "Public can read published match pages"
  on public.match_pages
  for select
  using (status = 'published');

-- Policy: Authenticated users can do everything (for admin)
create policy "Authenticated users have full access"
  on public.match_pages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Grant permissions
grant select on public.match_pages to anon;
grant all on public.match_pages to authenticated;
