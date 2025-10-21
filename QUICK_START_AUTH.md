# Quick Start Guide - Testing Authentication

## Prerequisites
You need:
1. A Supabase account and project
2. Your Supabase project URL and anon key

## Step 1: Set Up Environment Variables

1. Navigate to the web directory:
```bash
cd web
```

2. Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" and "anon/public" key

## Step 2: Run Database Migration

### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Open the file `/db/migrations/005_add_subscription_tier.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click "Run" to execute

### Option B: Via Supabase CLI (If installed)

```bash
cd /Users/ericchamberlin/Downloads/world_cup/worldcup
supabase db push
```

## Step 3: Create Profile Auto-Generation Trigger

In the Supabase SQL Editor, run this SQL to automatically create profiles for new users:

```sql
-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, subscription_tier, subscription_status)
  VALUES (NEW.id, NEW.email, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Start the Development Server

```bash
cd web
npm run dev
```

The app should start at `http://localhost:3000`

## Step 5: Test the Authentication Flow

### Test Scenario 1: AI Planner Access
1. Visit `http://localhost:3000/planner`
2. You should see an auth modal (signup/login)
3. Click "Sign Up" tab
4. Enter email and password
5. Click "Sign Up"
6. Modal should close and you should see the AI Travel Planner

### Test Scenario 2: Forums Access
1. Visit `http://localhost:3000/forums`
2. You should see an auth modal (signup/login)
3. If you already signed up in Test 1, click "Sign In" tab
4. Enter your email and password
5. Click "Sign In"
6. Modal should close and you should see the Forums page with city list

### Test Scenario 3: Session Persistence
1. After logging in, refresh the page
2. You should stay logged in (no auth modal)
3. Navigate between `/planner` and `/forums`
4. You should have access to both without seeing the auth modal again

## Troubleshooting

### "Cannot find module '@/lib/supabaseClient'"
- Make sure you're in the `web` directory when running the dev server
- The file exists at `/web/lib/supabaseClient.ts`
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Invalid API Key" or Supabase errors
- Double-check your `.env.local` file
- Make sure there are no quotes around the values
- Make sure you copied the anon (public) key, not the service role key
- Restart the dev server after changing `.env.local`

### Auth modal doesn't close after signup/login
- Check browser console for errors
- Make sure the profile trigger was created (Step 3)
- Check Supabase dashboard → Authentication → Users to see if user was created

### Cities don't load on Forums page
- Make sure you have cities in your database
- Check Supabase dashboard → Table Editor → cities table
- If empty, you need to seed the cities table with host city data

## What's Protected?

✅ **Gated Content** (Requires Login):
- AI Travel Planner (`/planner`)
- Forums (`/forums`)

✅ **Public Content** (No Login Required):
- Homepage (`/`)
- Team pages (`/teams/*`)
- City guides (`/cityguides/*`)

## Current Authentication Features

- ✅ Email/password signup
- ✅ Email/password login
- ✅ Session persistence
- ✅ Modal-based authentication (no separate auth pages)
- ✅ Automatic redirect after auth
- ✅ Loading states
- ✅ Error handling
- ✅ All logged-in users get full access (free tier)

## Future Features (Not Yet Implemented)

- ⏳ User menu in header (shows email, sign out button)
- ⏳ Protected CTA buttons throughout site
- ⏳ Admin verification of subscription tiers
- ⏳ Paid subscriptions via Lemon Squeezy
- ⏳ Tier-based content gating (free vs premium vs pro)

## Next Development Steps

See `AUTH_IMPLEMENTATION_STATUS.md` for detailed next steps and future enhancements.
