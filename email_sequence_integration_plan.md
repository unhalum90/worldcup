# 📧 Email System Integration Plan
**Project:** World Cup Fan Zone  
**Stack:** Supabase + Next.js + MailerLite  
**Objective:** Connect user creation and onboarding events to MailerLite automations, ensuring every new user enters a sequenced email journey.

---

## 1. Current Verified Architecture

| Layer | Current Behavior |
|-------|------------------|
| **Supabase Auth** | Sends OTP magic link via modal; new users redirected to onboarding |
| **Onboarding Flow** | Saves travel context into `user_profile` |
| **Mailing List Table** | Exists but no `user_id` link; used only by `/api/subscribe` |
| **MailerLite Integration** | Wired and functional but only used by `/api/subscribe` endpoint (not modal) |
| **Beehiiv/Make Webhook** | Receives newsletter signups from `/api/newsletter-optin`; not linked to MailerLite |
| **Transactional MailerLite** | Verified working (contact form) |

---

## 2. Gaps to Address

1. New users created via OTP flow **never reach MailerLite**.
2. No durable link between Supabase users ↔ MailerLite subscribers.
3. Onboarding metadata (airport, tickets, climate prefs, etc.) **never syncs** to MailerLite custom fields.
4. `/api/subscribe` does not de-duplicate or tag properly.
5. Beehiiv webhook continues to run redundantly.
6. MailerLite automations exist but lack triggers linked to new signups.

---

## 3. Target Architecture

```
User → Supabase Auth (magic link)
       ↓
Auth callback establishes session (/auth/callback)
       ↓
Onboarding wizard submits → `/api/profile` (PUT)
       ↓
Service helper (`syncMailingList`) upserts mailing_list, links `user_id`, syncs MailerLite
       ↓
Subscriber added to MailerLite groups + automation (see §7)
       ↓
Profile context mapped to MailerLite custom fields + tag `onboarding_completed`
```

---

## 4. Database Updates

**Migration:** `015_mailing_list_user_link.sql`

```sql
UPDATE mailing_list
SET email = lower(trim(email));

WITH ranked AS (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, id DESC) AS rn
  FROM mailing_list
)
DELETE FROM mailing_list
USING ranked
WHERE mailing_list.id = ranked.id
  AND ranked.rn > 1;

ALTER TABLE mailing_list
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS mailerlite_id text;

ALTER TABLE mailing_list
  ADD CONSTRAINT mailing_list_email_unique UNIQUE (email);

CREATE INDEX IF NOT EXISTS idx_mailing_list_user_id ON mailing_list(user_id);
```

This ensures:
- One record per unique email.
- Persistent cross-link between Supabase and MailerLite.
- Fast lookups when a Supabase user updates their profile.

---

## 5. MailerLite Service Helper

**File:** `web/lib/mailerlite/server.ts`

```typescript
export async function syncMailingList({
  email,
  userId,
  source = 'onboarding',
  tags = [],
  metadata = {},
  fields = {},
  groups,
  pushToMailerLite = true,
}: MailingListSyncOptions) {
  // 1) Normalize email & fetch existing row.
  // 2) Upsert mailing_list with merged tags/metadata + user_id linkage.
  // 3) Optionally call MailerLite (POST /subscribers + PATCH) to keep custom fields current.
  // 4) Persist returned `mailerlite_id` for future updates.
}
```

---

## 6. Update Onboarding Sync

Inside `/api/profile/route.ts`, **after** onboarding data upsert, invoke the helper:

```typescript
await syncMailingList({
  email: user.email!,
  userId: user.id,
  source: 'onboarding',
  tags: ['onboarding_completed', /* derived focus/team tags */],
  metadata: { profile_snapshot: {...} },
  fields: {
    source: 'onboarding',
    home_airport: profile.home_airport?.code,
    group_size: profile.group_size,
    tickets: profile.has_tickets ? 1 : 0,
    climate_pref: profile.climate_preference,
    favorite_team: profile.favorite_team,
  },
  confirmed: true,
});
```

---

## 7. MailerLite Automations

### Group: `New Users – Fan Zone`
**Trigger:** User joins group.

| Step | Delay | Email Name | Description |
|------|--------|-------------|--------------|
| 1 | Immediate | Welcome to Fan Zone | Confirms signup, introduces trip planner |
| 2 | +1 day | Getting Started Guide | Walkthrough of dashboard + example trip |
| 3 | +3 days | Pro Tips for Fans | Transit, lodging, and ticketing hacks |
| 4 | +5 days | Share with Friends | Referral CTA |
| 5 | +7 days | What’s Next | Preview of updates, newsletter schedule |

### Custom Fields to Create in MailerLite

| Field | Type | Example | Source |
|--------|------|----------|---------|
| `home_airport` | text | DFW | `user_profile` |
| `group_size` | number | 3 | `user_profile` |
| `tickets` | number | 2 | `user_profile` |
| `climate_pref` | text | mild | `user_profile` |
| `source` | text | onboarding | profile sync |

---

## 8. Environment Variables

| Key | Purpose |
|-----|----------|
| `MAILERLITE_API_KEY` | MailerLite access token |
| `MAILERLITE_WEBSITE_GROUP_ID` | Group ID for general automations |
| `MAILERLITE_NEWSLETTER_GROUP_ID` | Group ID for newsletter/sequence |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Service access for mailing_list upserts |
| `NEXT_PUBLIC_ENABLE_ONBOARDING_GATE` | Controls middleware behavior |

---

## 9. Testing Protocol

| Step | Action | Expected Result |
|------|---------|-----------------|
| 1 | Signup via modal (OTP) | Magic link delivered |
| 2 | Click magic link → onboarding | `mailing_list` upserted, MailerLite subscriber created |
| 3 | Complete onboarding | Custom fields + tag updated in MailerLite |
| 4 | Check MailerLite automation | Welcome email sent immediately |
| 5 | Verify field sync | Profile data appears in MailerLite dashboard |
| 6 | Repeat with existing email | De-dupe logic prevents duplicates, updates existing record |

---

## 10. Beehiiv Status

- Beehiiv webhook retired; `/api/newsletter-optin` now stores opt-ins in Supabase only.
- No outbound Beehiiv calls remain in the codebase.
- Future newsletter experiments should route through MailerLite (or reintroduce a new bridge explicitly).

---

## 11. Deployment Steps

1. ✅ Create/verify MailerLite groups + custom fields.
2. ✅ Apply DB migration for `mailing_list`.
3. ✅ Confirm environment variables (`MAILERLITE_*`, `SUPABASE_SECRET_KEY`) in `.env.local` and Vercel.
4. ✅ Deploy `syncMailingList` helper + reuse in `/api/subscribe` & `/api/newsletter-optin`.
5. ✅ Wire onboarding PUT (`/api/profile`) to `syncMailingList` with profile fields.
6. ✅ Retire Beehiiv webhook (modal now writes to Supabase only).
7. ✅ Verify full magic-link → onboarding → automation flow end-to-end.

---

**Deliverable Owner:** Eric Chamberlin  
**Dev Owner:** Backend Dev (Supabase + Next.js)  
**Version:** 1.0  
**Last Updated:** November 2025
