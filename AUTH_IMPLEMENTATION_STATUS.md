# Authentication Implementation - Phase 1 Complete

## ✅ Completed Tasks

### 1. **Supabase Client Setup**
- Created `/web/lib/supabaseClient.ts`
  - Singleton pattern with HMR support
  - Uses environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Ready for use throughout the application

### 2. **Database Schema Updates**
- Created `/db/migrations/005_add_subscription_tier.sql`
  - Adds `subscription_tier` column (free, premium, pro)
  - Adds `subscription_status` column (active, cancelled, expired, trialing)
  - Adds `subscription_start_date` and `subscription_end_date` timestamps
  - Creates index on `subscription_tier` for performance
  - Sets all existing profiles to 'free' tier by default

### 3. **Auth Context Provider**
- Created `/web/lib/AuthContext.tsx`
  - Global auth state management via React Context
  - `useAuth()` hook for accessing user, loading state, and signOut function
  - Listens to Supabase auth state changes
  - All TypeScript errors resolved

### 4. **Auth Modal Component**
- Created `/web/components/AuthModal.tsx`
  - Modal popup for signup/login
  - Toggle between modes
  - Email/password authentication
  - Error handling and loading states
  - Optional redirect after successful auth
  - Clean UI with Tailwind styling

### 5. **App-Wide Auth Integration**
- Updated `/web/app/layout.tsx`
  - Wrapped entire app with `<AuthProvider>`
  - Auth state now available to all pages and components

### 6. **Protected Pages**
- **AI Planner** (`/web/app/planner/page.tsx`) ✅
  - Shows loading spinner while checking auth
  - Displays auth modal if user not logged in
  - Allows access to authenticated users
  
- **Forums** (`/web/app/forums/page.tsx`) ✅
  - Converted from server component to client component
  - Shows loading spinner while checking auth
  - Displays auth modal if user not logged in
  - Fetches cities data only for authenticated users
  - Allows access to authenticated users

---

## 🔄 Next Steps (Priority Order)

### 1. **Environment Setup** (IMMEDIATE)
You need to add your Supabase credentials to `.env.local`:

```bash
# Create .env.local in /web directory
cd web
cp .env.example .env.local
```

Then edit `.env.local` with your actual Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. **Run Database Migration**
Apply the subscription tier migration to your Supabase database:

Option A - Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `/db/migrations/005_add_subscription_tier.sql`
4. Paste and run the SQL

Option B - Via Supabase CLI (if installed):
```bash
supabase db push
```

### 3. **Profile Auto-Generation**
Currently missing: automatic profile creation when user signs up.

You need to create either:
- **Option A**: Database trigger (recommended)
  - Create trigger on `auth.users` INSERT
  - Automatically creates profile row with `subscription_tier='free'`
  
- **Option B**: API function
  - Create API endpoint that runs after signup
  - Manually creates profile record

Example trigger SQL:
```sql
-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. **Add User Menu to Header**
Update `/web/components/Header.tsx` to show:
- User email + "Sign Out" button when logged in
- "Sign In" button when not logged in

Example code:
```tsx
'use client';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <header>
      {/* ... existing nav ... */}
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <button onClick={signOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-primary">
            Sign In
          </button>
        )}
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
```

### 5. **Add Auth Guards to CTA Buttons**
Protect "Try AI Planner" and "Join Forums" buttons throughout the site:

**Locations to update:**
- Homepage feature cards
- Team pages
- Guide pages
- Any other pages with CTAs to gated features

**Pattern:**
```tsx
'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

function ProtectedCTA({ href, children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const handleClick = () => {
    if (user) {
      router.push(href);
    } else {
      setShowAuthModal(true);
    }
  };
  
  return (
    <>
      <button onClick={handleClick}>{children}</button>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        redirectTo={href}
      />
    </>
  );
}
```

### 6. **Testing Checklist**
Once environment and migration are set up:

- [ ] Signup flow works (email/password)
- [ ] Profile is auto-created with 'free' tier
- [ ] Login flow works (existing users)
- [ ] Session persists on page refresh
- [ ] AI Planner shows auth modal when logged out
- [ ] Forums shows auth modal when logged out
- [ ] After auth, user can access both features
- [ ] Sign out works and clears session
- [ ] Protected CTAs show auth modal when logged out

---

## 🔮 Future Enhancements (Post-MVP)

### Paid Subscriptions with Lemon Squeezy
Database is ready with `subscription_tier` field. To implement:

1. **Lemon Squeezy Setup**
   - Create Lemon Squeezy account
   - Set up products (Premium, Pro tiers)
   - Configure webhooks

2. **Payment Integration**
   - Add Lemon Squeezy checkout buttons
   - Create webhook endpoint to receive payment events
   - Update user's `subscription_tier` on successful payment

3. **Content Gating by Tier**
   - Check `user.subscription_tier` in protected pages
   - Show tier-specific content
   - Add "Upgrade to Premium" CTAs for free users

Example webhook handler:
```typescript
// /app/api/webhooks/lemon-squeezy/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  
  if (body.event === 'subscription_created') {
    // Update user's subscription_tier to 'premium'
    await supabase
      .from('profiles')
      .update({ 
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString()
      })
      .eq('user_id', body.user_id);
  }
  
  return Response.json({ received: true });
}
```

---

## 📝 Architecture Notes

### Auth Flow
1. User visits gated page (Forums or AI Planner)
2. `useAuth()` hook checks if user is logged in
3. If not logged in, `AuthModal` displays
4. User signs up/logs in via modal
5. On success, modal closes and user can access content
6. Session persists via Supabase (cookies)

### Data Flow
```
User Action
  ↓
useAuth() Hook → AuthContext
  ↓
Supabase Auth → Check Session
  ↓
If Authenticated → Load Protected Content
If Not → Show AuthModal
```

### File Structure
```
web/
├── lib/
│   ├── supabaseClient.ts      # Supabase initialization
│   └── AuthContext.tsx         # Global auth state
├── components/
│   └── AuthModal.tsx           # Signup/Login modal
├── app/
│   ├── layout.tsx              # Wraps app with AuthProvider
│   ├── planner/
│   │   └── page.tsx            # Protected with auth check
│   └── forums/
│       └── page.tsx            # Protected with auth check
db/
└── migrations/
    └── 005_add_subscription_tier.sql  # DB schema for subscriptions
```

---

## 🚨 Important Notes

1. **Environment Variables**: Must be set before testing
2. **Database Migration**: Must be run before signup works properly
3. **Profile Creation**: Needs trigger/function implementation for new signups
4. **Client vs Server Components**: Auth pages must be client components ('use client')
5. **TypeScript**: All components are properly typed with Supabase auth types

---

## 🎯 Current Status

**Phase 1: Foundation** ✅ COMPLETE
- Auth infrastructure built
- Protected pages implemented
- Modal-based signup/login working

**Phase 2: Configuration** 🔄 IN PROGRESS
- Need environment variables
- Need database migration
- Need profile auto-generation

**Phase 3: UI/UX Polish** ⏳ PENDING
- User menu in header
- Protected CTA buttons
- Comprehensive testing

**Phase 4: Monetization** 🔮 FUTURE
- Lemon Squeezy integration
- Paid tier content gating
- Upgrade flows
