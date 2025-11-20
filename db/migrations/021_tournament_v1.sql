-- Tournament v1 — Anonymous-friendly voting and comments
-- Focus: minimal schema, permissive SELECT, anonymous INSERT with IP+cookie uniqueness, slugged matches

-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- Config table
create table if not exists public.tournament_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text check (status in ('upcoming','active','completed')) default 'upcoming',
  start_date timestamptz not null,
  end_date timestamptz,
  description text,
  created_at timestamptz default now()
);

-- Matches table (city-based bracket entries)
create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournament_config(id) on delete cascade,
  slug text unique not null, -- e.g. dallas-vs-toronto
  round_number integer not null default 1,
  match_number integer,
  city_a_id uuid not null references public.cities(id),
  city_b_id uuid not null references public.cities(id),
  votes_a integer not null default 0,
  votes_b integer not null default 0,
  status text not null check (status in ('upcoming','active','closed')) default 'upcoming',
  voting_opens_at timestamptz,
  voting_closes_at timestamptz,
  winner_city_id uuid references public.cities(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Votes table (anonymous allowed)
create table if not exists public.tournament_votes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.tournament_matches(id) on delete cascade,
  city_id uuid not null references public.cities(id),
  user_id uuid references auth.users(id), -- optional
  ip_address text,
  cookie_id text,
  created_at timestamptz default now()
);

-- Partial unique indexes to enforce 1 vote per (user OR ip OR cookie) per match
create unique index if not exists uq_tournament_votes_match_user on public.tournament_votes(match_id, user_id) where user_id is not null;
create unique index if not exists uq_tournament_votes_match_ip on public.tournament_votes(match_id, ip_address) where ip_address is not null;
create unique index if not exists uq_tournament_votes_match_cookie on public.tournament_votes(match_id, cookie_id) where cookie_id is not null;

-- Comments table (anonymous allowed)
create table if not exists public.tournament_comments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.tournament_matches(id) on delete cascade,
  city_id uuid references public.cities(id), -- optional, comment can be about a specific city
  user_id uuid references auth.users(id), -- optional
  ip_address text,
  cookie_id text,
  display_name text,
  comment_text text not null,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_tournament_comments_match_created on public.tournament_comments(match_id, created_at desc);

-- RLS
alter table public.tournament_config enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.tournament_votes enable row level security;
alter table public.tournament_comments enable row level security;

-- Public read access
drop policy if exists "tournament_config_select_all" on public.tournament_config;
create policy "tournament_config_select_all" on public.tournament_config for select using (true);

drop policy if exists "tournament_matches_select_all" on public.tournament_matches;
create policy "tournament_matches_select_all" on public.tournament_matches for select using (true);

drop policy if exists "tournament_votes_select_all" on public.tournament_votes;
create policy "tournament_votes_select_all" on public.tournament_votes for select using (true);

drop policy if exists "tournament_comments_select_all" on public.tournament_comments;
create policy "tournament_comments_select_all" on public.tournament_comments for select using (true);

-- Anonymous inserts (with safety checks)
drop policy if exists "tournament_votes_insert_anyone" on public.tournament_votes;
create policy "tournament_votes_insert_anyone" on public.tournament_votes
  for insert
  with check (
    exists (
      select 1 from public.tournament_matches m
      where m.id = match_id
        and m.status = 'active'
        and (city_id = m.city_a_id or city_id = m.city_b_id)
    )
  );

drop policy if exists "tournament_comments_insert_anyone" on public.tournament_comments;
create policy "tournament_comments_insert_anyone" on public.tournament_comments
  for insert
  with check (true);

-- No public update/delete policies; admins should use service role for moderation and match state changes.

-- Voting function: enforces active match and updates counters; returns fresh totals
create or replace function public.cast_tournament_vote(
  p_match_id uuid,
  p_city_id uuid,
  p_user_id uuid default null,
  p_ip_address text default null,
  p_cookie_id text default null
) returns json language plpgsql security definer as $$
declare
  v_match record;
  v_result json;
begin
  select * into v_match from public.tournament_matches where id = p_match_id and status = 'active';
  if v_match is null then
    return json_build_object('success', false, 'error', 'Match not open for voting');
  end if;

  -- Insert vote; uniqueness prevents duplicates by user/ip/cookie
  begin
    insert into public.tournament_votes(match_id, city_id, user_id, ip_address, cookie_id)
    values (p_match_id, p_city_id, p_user_id, p_ip_address, p_cookie_id);
  exception when unique_violation then
    return json_build_object('success', false, 'error', 'Already voted');
  end;

  if p_city_id = v_match.city_a_id then
    update public.tournament_matches set votes_a = votes_a + 1, updated_at = now() where id = p_match_id;
  elsif p_city_id = v_match.city_b_id then
    update public.tournament_matches set votes_b = votes_b + 1, updated_at = now() where id = p_match_id;
  else
    -- City not part of match (should be prevented by policy, but double-guard)
    return json_build_object('success', false, 'error', 'Invalid city for match');
  end if;

  select json_build_object(
    'success', true,
    'votes_a', votes_a,
    'votes_b', votes_b
  ) into v_result from public.tournament_matches where id = p_match_id;

  return v_result;
end;$$;

