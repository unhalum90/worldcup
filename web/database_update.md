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
  stadium_name text,
  stadium_lat numeric,
  stadium_long numeric,
  fan_fest_location text,
  fan_fest_lat numeric,
  fan_fest_long numeric,
  is_hub boolean DEFAULT false,
  airport_code text,
  updated_at timestamp with time zone DEFAULT now(),
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
CREATE TABLE public.did_you_know_facts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city_id uuid,
  fact_text text NOT NULL,
  image_url text,
  category text,
  language text DEFAULT 'en'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT did_you_know_facts_pkey PRIMARY KEY (id),
  CONSTRAINT did_you_know_facts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
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
CREATE TABLE public.lodging_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid,
  city text NOT NULL,
  preferences jsonb,
  zoning jsonb,
  summary_md text,
  prompt_payload jsonb,
  model_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lodging_plans_pkey PRIMARY KEY (id),
  CONSTRAINT lodging_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT lodging_plans_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.travel_plans(id)
);
CREATE TABLE public.mailing_list (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source text,
  tags jsonb DEFAULT '[]'::jsonb,
  confirmed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  mailerlite_id text,
  CONSTRAINT mailing_list_pkey PRIMARY KEY (id),
  CONSTRAINT mailing_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_date date NOT NULL,
  match_time time without time zone NOT NULL,
  city_id uuid NOT NULL,
  stadium_name text NOT NULL,
  match_number integer,
  stage text,
  group_name text,
  home_team text,
  away_team text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
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
  email text,
  name text,
  updated_at timestamp with time zone DEFAULT now(),
  is_member boolean DEFAULT false,
  subscription_renews_at timestamp with time zone,
  subscription_cancels_at timestamp with time zone,
  member_since timestamp with time zone,
  ls_customer_id text,
  ls_subscription_id text,
  ls_product_id text,
  ls_variant_id text,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  product_id text,
  product_name text,
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD'::text,
  status text DEFAULT 'completed'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'refunded'::text, 'failed'::text, 'void'::text])),
  ls_order_id text UNIQUE,
  payload jsonb DEFAULT '{}'::jsonb,
  purchase_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ls_customer_id text,
  ls_variant_id text,
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
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
CREATE TABLE public.tournament_comment_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid,
  ip_address text,
  cookie_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tournament_comment_votes_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_comment_votes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.tournament_comments(id),
  CONSTRAINT tournament_comment_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tournament_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  city_id uuid,
  user_id uuid,
  ip_address text,
  cookie_id text,
  display_name text,
  comment_text text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  score integer NOT NULL DEFAULT 0,
  CONSTRAINT tournament_comments_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_comments_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.tournament_matches(id),
  CONSTRAINT tournament_comments_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
  CONSTRAINT tournament_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tournament_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'completed'::text])),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tournament_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tournament_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tournament_id uuid,
  slug text NOT NULL UNIQUE,
  round_number integer NOT NULL DEFAULT 1,
  match_number integer,
  city_a_id uuid NOT NULL,
  city_b_id uuid NOT NULL,
  votes_a integer NOT NULL DEFAULT 0,
  votes_b integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'closed'::text])),
  voting_opens_at timestamp with time zone,
  voting_closes_at timestamp with time zone,
  winner_city_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournament_config(id),
  CONSTRAINT tournament_matches_city_a_id_fkey FOREIGN KEY (city_a_id) REFERENCES public.cities(id),
  CONSTRAINT tournament_matches_city_b_id_fkey FOREIGN KEY (city_b_id) REFERENCES public.cities(id),
  CONSTRAINT tournament_matches_winner_city_id_fkey FOREIGN KEY (winner_city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.tournament_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  city_id uuid NOT NULL,
  user_id uuid,
  ip_address text,
  cookie_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tournament_votes_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_votes_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.tournament_matches(id),
  CONSTRAINT tournament_votes_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
  CONSTRAINT tournament_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.travel_plan_saved (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_input jsonb,
  itinerary jsonb,
  selected_option_index integer,
  title text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT travel_plan_saved_pkey PRIMARY KEY (id),
  CONSTRAINT travel_plan_saved_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.travel_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  origin_city text,
  group_size integer,
  children integer DEFAULT 0,
  seniors integer DEFAULT 0,
  mobility_issues boolean DEFAULT false,
  transport_mode text,
  budget_level text,
  cities_visiting ARRAY,
  following_team text,
  start_date date,
  end_date date,
  itinerary jsonb,
  user_email text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  origin_airport jsonb,
  trip_focus ARRAY DEFAULT '{}'::text[],
  has_match_tickets boolean DEFAULT false,
  match_dates ARRAY DEFAULT '{}'::text[],
  ticket_cities ARRAY DEFAULT '{}'::text[],
  personal_context text,
  surprise_me boolean DEFAULT false,
  food_preference text,
  nightlife_preference text,
  climate_preference text,
  CONSTRAINT travel_plans_pkey PRIMARY KEY (id),
  CONSTRAINT travel_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.trip_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_context jsonb NOT NULL,
  flights_data jsonb,
  lodging_data jsonb,
  ground_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT trip_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  home_city text,
  home_airport jsonb,
  group_size integer DEFAULT 1 CHECK (group_size >= 1),
  children integer DEFAULT 0 CHECK (children >= 0),
  seniors integer DEFAULT 0 CHECK (seniors >= 0),
  mobility_issues boolean DEFAULT false,
  budget_level text CHECK (budget_level = ANY (ARRAY['budget'::text, 'moderate'::text, 'premium'::text])),
  comfort_preference text CHECK (comfort_preference = ANY (ARRAY['budget_friendly'::text, 'balanced'::text, 'luxury_focus'::text])),
  food_preference text CHECK (food_preference = ANY (ARRAY['local_flavors'::text, 'international'::text, 'mix'::text])),
  nightlife_preference text CHECK (nightlife_preference = ANY (ARRAY['quiet'::text, 'social'::text, 'party'::text])),
  climate_preference text CHECK (climate_preference IS NULL OR (climate_preference = ANY (ARRAY['all'::text, 'prefer_northerly'::text, 'comfortable'::text]))),
  travel_focus ARRAY DEFAULT '{}'::text[],
  preferred_transport text CHECK (preferred_transport = ANY (ARRAY['public'::text, 'car'::text, 'mixed'::text])),
  languages ARRAY,
  currency text,
  favorite_team text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  children_0_5 integer DEFAULT 0 CHECK (children_0_5 >= 0),
  children_6_18 integer DEFAULT 0 CHECK (children_6_18 >= 0),
  has_tickets boolean DEFAULT false,
  ticket_match jsonb,
  CONSTRAINT user_profile_pkey PRIMARY KEY (id),
  CONSTRAINT user_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
CREATE TABLE public.zones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL,
  zone_name text NOT NULL,
  lat numeric NOT NULL,
  long numeric NOT NULL,
  drive_time_to_stadium integer,
  public_time_to_stadium integer,
  drive_time_to_fanfest integer,
  public_time_to_fanfest integer,
  transit_quality integer CHECK (transit_quality >= 1 AND transit_quality <= 10),
  hotel_density integer,
  safety_score integer CHECK (safety_score >= 1 AND safety_score <= 10),
  nightlife_score integer CHECK (nightlife_score >= 1 AND nightlife_score <= 10),
  family_score integer CHECK (family_score >= 1 AND family_score <= 10),
  tag text,
  fan_vibe text,
  parking_availability text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT zones_pkey PRIMARY KEY (id),
  CONSTRAINT zones_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);