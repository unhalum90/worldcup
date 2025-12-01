-- Draw groups for 2026 (12 groups, 4 slots each)
-- Run in Supabase SQL editor or your migration pipeline.

create table if not exists public.draw_groups (
  id uuid primary key default gen_random_uuid(),
  group_code text not null check (group_code ~ '^[A-L]$'),
  slot int not null check (slot >= 1 and slot <= 4),
  team_name text,
  team_slug text,
  is_placeholder boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (group_code, slot)
);

alter table public.draw_groups enable row level security;

-- Postgres doesn’t support IF NOT EXISTS for policies; drop then recreate for idempotency.
drop policy if exists "draw_groups_select_public" on public.draw_groups;
create policy "draw_groups_select_public"
  on public.draw_groups
  for select
  using (true);

-- Seed 48 empty slots if they do not exist yet.
insert into public.draw_groups (group_code, slot)
select g, s
from unnest(array['A','B','C','D','E','F','G','H','I','J','K','L']) as g,
     generate_series(1,4) as s
on conflict (group_code, slot) do nothing;
