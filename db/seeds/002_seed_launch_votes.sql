-- Seed launch votes for active Round 1 matches
-- Purpose: make pages look "warmed up" with dozens of votes
-- Run once on launch day. Safe to re-run if you want to bump counts again.

with targets as (
  select id from public.tournament_matches
  where round_number = 1 and status = 'active'
), r as (
  -- For each match, pick a total between 60 and 120 and a random split
  select t.id,
         (60 + floor(random() * 61))::int as total,
         random() as share
  from targets t
), split as (
  select id,
         greatest(10, floor(total * share))::int as a,
         greatest(10, total - floor(total * share))::int as b
  from r
)
update public.tournament_matches m
set votes_a = m.votes_a + s.a,
    votes_b = m.votes_b + s.b,
    updated_at = now()
from split s
where m.id = s.id;

-- Optional: ensure results bar appears by setting a hard minimum total of 50
-- (Uncomment if needed)
-- update public.tournament_matches
-- set votes_a = case when votes_a + votes_b < 50 then votes_a + 25 else votes_a end,
--     votes_b = case when votes_a + votes_b < 50 then votes_b + 25 else votes_b end
-- where round_number = 1 and status = 'active';

