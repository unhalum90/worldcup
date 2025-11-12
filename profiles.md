Root cause: your app logic expects profiles.is_member and subscription fields. Your profiles table does not have is_member or Lemon Squeezy identifiers, and it lacks a foreign key to auth.users. The webhook can’t reliably map an LS event to a profiles.user_id, and the UI therefore reads “not a member.”

Fix = align schema + webhook mapping + RLS. Here is the minimal, concrete patch.

1) Schema patch (Supabase SQL)

-- 1. Ensure profiles <-> auth.users linkage and fast email lookups
alter table public.profiles
  add column if not exists email text,
  add column if not exists name text;

-- backfill emails from auth.users on first run (optional if already present)
update public.profiles p
set email = au.email
from auth.users au
where p.user_id = au.id and (p.email is null or p.email = '');

-- add FK to auth.users and uniqueness on email
alter table public.profiles
  add constraint profiles_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email));

-- 2. Add membership flags and LS identifiers expected by your middleware/webhook
alter table public.profiles
  add column if not exists is_member boolean not null default false,
  add column if not exists ls_customer_id text,
  add column if not exists ls_subscription_id text,
  add column if not exists ls_last_order_id text,
  add column if not exists ls_product_id text,
  add column if not exists ls_variant_id text,
  add column if not exists member_since timestamptz,
  add column if not exists subscription_renews_at timestamptz,
  add column if not exists subscription_cancels_at timestamptz;

-- optional: simplify tiers to a single source of truth
-- keep account_level OR subscription_tier, not both. Here we keep account_level.
alter table public.profiles
  drop constraint if exists profiles_subscription_tier_check;

-- normalize account_level values for your app: free | city_bundle | member
alter table public.profiles
  drop constraint if exists profiles_account_level_check;

alter table public.profiles
  add constraint profiles_account_level_check
  check (account_level in ('free','city_bundle','member'));

-- 3. Purchases: allow resolution by email when user_id is missing at purchase time
alter table public.purchases
  add column if not exists ls_customer_id text,
  add column if not exists ls_variant_id text;

create index if not exists purchases_email_idx on public.purchases (lower(email));
create index if not exists purchases_user_id_idx on public.purchases (user_id);

-- 4. Helpful derived view for gating
create or replace view public.active_members as
select
  p.user_id,
  p.email,
  coalesce(p.is_member, false) as is_member,
  p.account_level,
  p.subscription_status,
  p.subscription_renews_at,
  p.subscription_cancels_at
from public.profiles p
where
  (p.is_member = true)
  and (p.subscription_cancels_at is null or p.subscription_cancels_at > now());

2) Webhook update logic (server code expectations)

Your dev note says: “isActiveMember returns true when profiles.is_member = true” and webhook updates profiles.is_member/account_level/subscription_*. After the schema patch, update the mapping rules:
	•	On order_created or order_refunded (one-off PDF):
	•	Upsert purchases by ls_order_id.
	•	Set purchases.email, product_id, product_name, price, status.
	•	Attempt to resolve user_id:
	•	If the event included your site user id in metadata, use it.
	•	Else look up auth.users by lower(email) and assign if found.
	•	Do not flip is_member. If product is a bundle, set profiles.account_level='city_bundle' for that user.
	•	On subscription_created / subscription_updated / subscription_cancelled:
	•	Resolve profile row by:
	1.	ls_customer_id match, else
	2.	auth.users.email == event.customer_email, else
	3.	store identifiers only; a later login handler can attach by email.
	•	Set:
	•	is_member = true when status in (active,trialing); false when (cancelled,expired).
	•	account_level = 'member' when active; fallback to 'free' otherwise.
	•	ls_customer_id, ls_subscription_id, ls_product_id, ls_variant_id.
	•	member_since on first activation if null.
	•	subscription_renews_at and subscription_cancels_at from LS payload.

Pseudocode:

const user = await findUserByCustomerOrEmail(ls_customer_id, email);

await sql`
  update public.profiles
  set
    is_member = ${isActiveLike(ls_status)},
    account_level = ${isActiveLike(ls_status) ? 'member' : 'free'},
    ls_customer_id = ${ls_customer_id},
    ls_subscription_id = ${ls_subscription_id},
    ls_product_id = ${product_id},
    ls_variant_id = ${variant_id},
    member_since = coalesce(member_since, ${activated_at}),
    subscription_renews_at = ${renews_at},
    subscription_cancels_at = ${cancels_at},
    updated_at = now()
  where user_id = ${user?.id};
`;

await upsertPurchaseFromEvent(event); // keep audit trail

3) Login-time reconciliation (handles historic purchases)

Add a small server routine called on signin:

-- SQL function to attach orphan purchases by email to the just-signed-in user
create or replace function public.attach_purchases_to_user(p_user_id uuid)
returns void language plpgsql as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = p_user_id;
  update public.purchases
     set user_id = p_user_id, updated_at = now()
   where user_id is null and lower(email) = lower(v_email);
  update public.profiles
     set email = v_email
   where user_id = p_user_id and (email is null or email = '');
end$$;

Call it right after successful auth.

4) RLS essentials

Ensure the webhook uses the service role key and bypasses RLS. For client reads:

-- profiles: users read their own minimal fields
alter table public.profiles enable row level security;

create policy "read_own_profile"
on public.profiles for select
to authenticated
using (user_id = auth.uid());

create policy "update_self_profile_non_sensitive"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- purchases: user sees their own
alter table public.purchases enable row level security;

create policy "read_own_purchases"
on public.purchases for select
to authenticated
using (user_id = auth.uid());

Webhook runs with supabaseServiceRole so it can update regardless.

5) App-side gating contract
	•	UI check should read select is_member, account_level from public.active_members where user_id = auth.uid() or directly from profiles.
	•	Middleware must not assume fields that don’t exist. After patch, your existing logic that checks profiles.is_member will work.

6) Audit and repair commands

Run these once to diagnose current state:

-- Does your current user have a profile row?
select p.user_id, p.email, p.account_level, p.is_member
from public.profiles p
where p.user_id = auth.uid(); -- run in SQL editor with a specific UUID if needed

-- Is there a purchase for the LS order and email?
select * from public.purchases
where lower(email) = lower('YOUR_EMAIL_HERE')
order by created_at desc;

-- Orphan purchases lacking user_id
select * from public.purchases where user_id is null;

-- Profiles missing is_member after patch
select user_id, email from public.profiles where is_member is null;

If the membership still doesn’t appear after patching, replay a recent LS webhook event against /api/webhooks/lemonsqueezy and recheck the profile row.

7) Likely one-line blockers you hit
	•	Missing column profiles.is_member → middleware always false.
	•	No FK from profiles.user_id to auth.users(id) → fragile joins.
	•	Webhook matched by email but profiles.email empty → no update.
	•	Purchase done with a different email than the Supabase auth email → add login-time reconciliation.

Implement the schema patch, redeploy the webhook with the mapping above, and run the audit queries. This will make paid members resolve deterministically at sign-in.

Update: 2025-11-12 — minor doc tweak to trigger redeploy after membership pipeline fixes.
