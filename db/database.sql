-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  content_markdown text,
  excerpt text,
  city text,
  tags ARRAY DEFAULT ARRAY[]::text[],
  seo_keywords ARRAY DEFAULT ARRAY[]::text[],
  meta_description text,
  author_id uuid,
  published_at timestamp with time zone,
  view_count integer DEFAULT 0,
  featured_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text,
  tz text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  author_id uuid NOT NULL,
  body_md text,
  score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.keywords (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  city text,
  search_volume integer,
  competition text,
  source text,
  used_in_post_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT keywords_pkey PRIMARY KEY (id),
  CONSTRAINT keywords_used_in_post_id_fkey FOREIGN KEY (used_in_post_id) REFERENCES public.blog_posts(id),
  CONSTRAINT keywords_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.mailing_list (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source text,
  tags jsonb DEFAULT '[]'::jsonb,
  confirmed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT mailing_list_pkey PRIMARY KEY (id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid,
  author_id uuid NOT NULL,
  body_md text,
  score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id)
);
CREATE TABLE public.profiles (
  user_id uuid NOT NULL,
  handle text,
  role text DEFAULT 'user'::text,
  country text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text,
  status text DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);
CREATE TABLE public.threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city_id uuid,
  author_id uuid NOT NULL,
  title text NOT NULL,
  body_md text,
  topic text,
  pinned boolean DEFAULT false,
  locked boolean DEFAULT false,
  score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT threads_pkey PRIMARY KEY (id),
  CONSTRAINT threads_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  CONSTRAINT topics_pkey PRIMARY KEY (id),
  CONSTRAINT topics_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  value smallint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT votes_pkey PRIMARY KEY (id)
);