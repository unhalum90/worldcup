-- Manual seed script for Pre-Draw City Showdown (v1)
-- Run after 021_tournament_v1.sql has been applied.
-- Safe to re-run (idempotent) via ON CONFLICT upserts.

-- Helper: fetch city id by slug
with c as (
  select id, slug from public.cities
), upsert_t as (
  insert into public.tournament_config(name, slug, status, start_date, description)
  values ('Pre-Draw City Showdown','pre-draw-2024','active', now(), '16 cities. Single elimination. No-login voting.')
  on conflict (slug) do update set
    name = excluded.name,
    status = excluded.status,
    start_date = excluded.start_date,
    description = excluded.description
  returning id
), t as (
  -- ensure we always have the id even if ON CONFLICT DO UPDATE didn't return (it does, but belt-and-suspenders)
  select id from upsert_t
  union
  select id from public.tournament_config where slug = 'pre-draw-2024'
)
insert into public.tournament_matches(
  tournament_id, slug, round_number, match_number, city_a_id, city_b_id, status
)
values
  ((select id from t), 'dallas-vs-toronto', 1, 1, (select id from c where slug='dallas'), (select id from c where slug='toronto'), 'active'),
  ((select id from t), 'houston-vs-mexico-city', 1, 2, (select id from c where slug='houston'), (select id from c where slug='mexico-city'), 'active'),
  ((select id from t), 'los-angeles-vs-san-francisco', 1, 3, (select id from c where slug='los-angeles'), (select id from c where slug='san-francisco'), 'active'),
  ((select id from t), 'philadelphia-vs-boston', 1, 4, (select id from c where slug='philadelphia'), (select id from c where slug='boston'), 'active'),
  ((select id from t), 'atlanta-vs-miami', 1, 5, (select id from c where slug='atlanta'), (select id from c where slug='miami'), 'active'),
  ((select id from t), 'seattle-vs-monterrey', 1, 6, (select id from c where slug='seattle'), (select id from c where slug='monterrey'), 'active'),
  ((select id from t), 'vancouver-vs-guadalajara', 1, 7, (select id from c where slug='vancouver'), (select id from c where slug='guadalajara'), 'active'),
  ((select id from t), 'kansas-city-vs-new-york', 1, 8, (select id from c where slug='kansas-city'), (select id from c where slug='new-york'), 'active')
on conflict (slug) do update set
  tournament_id = excluded.tournament_id,
  round_number  = excluded.round_number,
  match_number  = excluded.match_number,
  city_a_id     = excluded.city_a_id,
  city_b_id     = excluded.city_b_id,
  status        = excluded.status;

-- Quarterfinals/Semifinals/Final can be inserted later when winners are determined.
