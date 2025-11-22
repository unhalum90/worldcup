-- Round 2 setup for Pre-Draw City Showdown (pre-draw-2024)
-- ------------------------------------------------------------------
-- This script:
--   1) Closes Round 1 matches and records winners (with Vancouver as the
--      tiebreak winner vs Guadalajara, and Seattle vs Monterrey).
--   2) Creates Round 2 (Quarterfinal) matchups using those winners.
--   3) Seeds each Round 2 match with 15–30 total votes, randomly split.
--
-- Safe to run once after Round 1 is finished. Re-running will:
--   - Keep the same winners (idempotent updates).
--   - Re‑seed additional votes on Round 2 matches (additive).

-- 1) Close Round 1 matches and set winners
-- ---------------------------------------

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'toronto'),
  updated_at = now()
where slug = 'dallas-vs-toronto';

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'mexico-city'),
  updated_at = now()
where slug = 'houston-vs-mexico-city';

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'los-angeles'),
  updated_at = now()
where slug = 'los-angeles-vs-san-francisco';

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'boston'),
  updated_at = now()
where slug = 'philadelphia-vs-boston';

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'miami'),
  updated_at = now()
where slug = 'atlanta-vs-miami';

-- Tie: Seattle vs Monterrey — choose Seattle as winner.
-- If you prefer Monterrey, change the slug below to 'monterrey'.
update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'seattle'),
  updated_at = now()
where slug = 'seattle-vs-monterrey';

-- Tie: Vancouver vs Guadalajara — per product call, Vancouver advances.
update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'vancouver'),
  updated_at = now()
where slug = 'vancouver-vs-guadalajara';

update public.tournament_matches
set
  status = 'closed',
  winner_city_id = (select id from public.cities where slug = 'kansas-city'),
  updated_at = now()
where slug = 'kansas-city-vs-new-york';

-- 2) Create Round 2 (Quarterfinal) matches
-- ----------------------------------------
-- Bracket:
--   QF1: Winner Match 1 vs Winner Match 2  → Toronto vs Mexico City
--   QF2: Winner Match 3 vs Winner Match 4  → Los Angeles vs Boston
--   QF3: Winner Match 5 vs Winner Match 6  → Miami vs Seattle
--   QF4: Winner Match 7 vs Winner Match 8  → Vancouver vs Kansas City

with t as (
  select id
  from public.tournament_config
  where slug = 'pre-draw-2024'
)
insert into public.tournament_matches (
  tournament_id,
  slug,
  round_number,
  match_number,
  city_a_id,
  city_b_id,
  status,
  voting_opens_at,
  voting_closes_at,
  votes_a,
  votes_b,
  updated_at
)
values
  (
    (select id from t),
    'toronto-vs-mexico-city',
    2,
    1,
    (select id from public.cities where slug = 'toronto'),
    (select id from public.cities where slug = 'mexico-city'),
    'active',
    '2024-11-22 00:00:00-05',
    '2024-11-25 23:59:00-05',
    0,
    0,
    now()
  ),
  (
    (select id from t),
    'los-angeles-vs-boston',
    2,
    2,
    (select id from public.cities where slug = 'los-angeles'),
    (select id from public.cities where slug = 'boston'),
    'active',
    '2024-11-22 00:00:00-05',
    '2024-11-25 23:59:00-05',
    0,
    0,
    now()
  ),
  (
    (select id from t),
    'miami-vs-seattle',
    2,
    3,
    (select id from public.cities where slug = 'miami'),
    (select id from public.cities where slug = 'seattle'),
    'active',
    '2024-11-22 00:00:00-05',
    '2024-11-25 23:59:00-05',
    0,
    0,
    now()
  ),
  (
    (select id from t),
    'vancouver-vs-kansas-city',
    2,
    4,
    (select id from public.cities where slug = 'vancouver'),
    (select id from public.cities where slug = 'kansas-city'),
    'active',
    '2024-11-22 00:00:00-05',
    '2024-11-25 23:59:00-05',
    0,
    0,
    now()
  )
on conflict (slug) do update
set
  tournament_id    = excluded.tournament_id,
  round_number     = excluded.round_number,
  match_number     = excluded.match_number,
  city_a_id        = excluded.city_a_id,
  city_b_id        = excluded.city_b_id,
  status           = excluded.status,
  voting_opens_at  = excluded.voting_opens_at,
  voting_closes_at = excluded.voting_closes_at,
  updated_at       = now();

-- 3) Seed Round 2 matches with 15–30 votes (random split)
-- -------------------------------------------------------

with targets as (
  select id
  from public.tournament_matches
  where
    round_number = 2
    and tournament_id = (select id from public.tournament_config where slug = 'pre-draw-2024')
), r as (
  -- For each match, pick a total between 15 and 30 and a random split.
  select
    t.id,
    (15 + floor(random() * 16))::int as total,
    random() as share
  from targets t
), split as (
  select
    id,
    greatest(5, floor(total * share))::int as a,
    greatest(5, total - floor(total * share))::int as b
  from r
)
update public.tournament_matches m
set
  votes_a   = m.votes_a + s.a,
  votes_b   = m.votes_b + s.b,
  updated_at = now()
from split s
where m.id = s.id;

