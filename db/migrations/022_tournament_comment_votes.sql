-- Add score + per-user/IP/cookie upvotes for comments

create extension if not exists pgcrypto;

-- Score column on comments
alter table if exists public.tournament_comments
  add column if not exists score integer not null default 0;

-- Votes table to prevent duplicate upvotes
create table if not exists public.tournament_comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.tournament_comments(id) on delete cascade,
  user_id uuid references auth.users(id),
  ip_address text,
  cookie_id text,
  created_at timestamptz default now()
);

create unique index if not exists uq_comment_votes_user on public.tournament_comment_votes(comment_id, user_id) where user_id is not null;
create unique index if not exists uq_comment_votes_ip on public.tournament_comment_votes(comment_id, ip_address) where ip_address is not null;
create unique index if not exists uq_comment_votes_cookie on public.tournament_comment_votes(comment_id, cookie_id) where cookie_id is not null;

alter table public.tournament_comment_votes enable row level security;

drop policy if exists "tournament_comment_votes_select_all" on public.tournament_comment_votes;
create policy "tournament_comment_votes_select_all" on public.tournament_comment_votes for select using (true);

drop policy if exists "tournament_comment_votes_insert_anyone" on public.tournament_comment_votes;
create policy "tournament_comment_votes_insert_anyone" on public.tournament_comment_votes for insert with check (true);

-- RPC to upvote a comment once per user/ip/cookie and increment score
create or replace function public.cast_tournament_comment_upvote(
  p_comment_id uuid,
  p_user_id uuid default null,
  p_ip_address text default null,
  p_cookie_id text default null
) returns json language plpgsql security definer as $$
declare
  v_exists boolean;
  v_score integer;
begin
  -- Ensure comment exists
  perform 1 from public.tournament_comments where id = p_comment_id;
  if not found then
    return json_build_object('success', false, 'error', 'Comment not found');
  end if;

  -- Insert guard (unique indexes enforce uniqueness)
  begin
    insert into public.tournament_comment_votes(comment_id, user_id, ip_address, cookie_id)
    values (p_comment_id, p_user_id, p_ip_address, p_cookie_id);
  exception when unique_violation then
    return json_build_object('success', false, 'error', 'Already upvoted');
  end;

  update public.tournament_comments set score = score + 1 where id = p_comment_id returning score into v_score;
  return json_build_object('success', true, 'score', v_score);
end;$$;

