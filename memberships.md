# WC26 Fan Zone: Complete Monetization & Access Control System
**Version 1.0 | Last Updated: October 21, 2024**

---

## 📋 Table of Contents
1. [Pricing Tiers](#pricing-tiers)
2. [Lemon Squeezy Product Setup](#lemon-squeezy-product-setup)
3. [Supabase Database Schema](#supabase-database-schema)
4. [Access Control Logic](#access-control-logic)
5. [Upsell & Credit System](#upsell--credit-system)
6. [Webhook Integration](#webhook-integration)
7. [Implementation Checklist](#implementation-checklist)

---

## 💰 Pricing Tiers

### Tier 1: Free Explorer
**Price:** $0  
**Target:** Casual browsers, undecided users  

**Includes:**
- ✅ Access to all city community pages
- ✅ Free newsletter subscription
- ✅ Join Fan Teams & Communities
- ✅ Read select "Best Of" guides
- ✅ 1 free city PDF sample (Dallas)
- ❌ No AI Travel Planner access
- ❌ No custom itineraries
- ❌ No additional city guides

**Purpose:** Lead generation, email capture

---

### Tier 2: Single City Guide
**Price:** $3.99 per city (one-time purchase)  
**Target:** Travelers planning a single destination  

**Includes:**
- ✅ Choose any official World Cup City Guide
- ✅ Comprehensive guide (50+ pages) with:
  - Lodging Zone insights & scoring
  - Transport and match-day tips
  - Local dining and nightlife
  - Hidden gems and safety info
- ✅ Lifetime download access
- ✅ Free newsletter + Fan Team access
- ❌ No AI Trip Planner
- ❌ No additional city guides

**Lemon Squeezy Product ID:** `single_city_guide`  
**Variants:** 16 products (one per city) OR 1 product with city selection dropdown

---

### Tier 3: 4-City Bundle ⭐ MOST POPULAR
**Price:** $9.99 (one-time purchase)  
**Target:** Fans following one team through group stage  
**Savings:** $6 vs buying 4 cities individually ($15.96)

**Includes:**
- ✅ Choose ANY 4 city guides
- ✅ Same 50+ page PDF quality per city
- ✅ Lifetime download access
- ✅ Free newsletter + communities
- ❌ No AI Travel Planner
- ❌ Limited to 4 cities

**Lemon Squeezy Product ID:** `bundle_4city`  
**Implementation:** User selects 4 cities at checkout, stored in `purchased_guides` array

**Marketing Badges:**
- 🌟 "MOST POPULAR"
- 💡 "Smart Choice: Most fans attend 3-4 cities"
- 📊 "Saves $6 vs buying separately"

---

### Tier 4: Fan Zone+ Membership
**Price:** 
- **$29/year** (Early Bird - until Dec 4, 2025)
- **$39/year** (Regular price - after Dec 5, 2025)

**Target:** Multi-city travelers, serious planners  

**Includes:**
- ✅ Unlimited AI Travel Planner access
- ✅ Generate custom itineraries for all host cities
- ✅ Save and share itineraries across devices
- ✅ Access to all city group chats & Fan Teams
- ✅ All 16 City Guides included (+ automatic updates)
- ✅ Early access to Game-Day Experience Planner (May 2026)
- ✅ Priority newsletter & insider tips
- ✅ Exclusive member discounts from partners
- ✅ Priority email support (24-hour response)

**Lemon Squeezy Product ID:** `membership_annual`

**Marketing Badges:**
- 💎 "BEST VALUE"
- 💰 "Pays for itself with 8+ city guides ($64 value)"
- 🔒 "Lock in $29 price forever"

---

## 🍋 Lemon Squeezy Product Setup

### Products to Create:

#### Product 1: Dallas Guide (Free)
```
Name: Dallas World Cup 2026 Guide (Free Sample)
Price: $0.00
Type: Digital Download
Delivery: Instant email with PDF link
```

#### Product 2: Single City Guide
```
Name: World Cup 2026 City Guide - [City Name]
Price: $3.99
Type: Digital Download
Variants:
  - Atlanta
  - Boston
  - Dallas (paid version)
  - Houston
  - Kansas City
  - Los Angeles
  - Miami
  - New York/New Jersey
  - Philadelphia
  - San Francisco Bay Area
  - Seattle
  - Guadalajara
  - Mexico City
  - Monterrey
  - Toronto
  - Vancouver

OR

Name: World Cup 2026 City Guide
Price: $3.99
Variants: Dropdown selector at checkout
Custom Fields: city_selection (required)
```

#### Product 3: 4-City Bundle
```
Name: World Cup 2026 - 4-City Bundle
Price: $9.99
Type: Digital Download
Custom Fields:
  - city_1 (dropdown, required)
  - city_2 (dropdown, required)
  - city_3 (dropdown, required)
  - city_4 (dropdown, required)
  
Validation: All 4 cities must be unique
```

#### Product 4: Fan Zone+ Membership (Annual)
```
Name: Fan Zone+ Annual Membership
Price: $29.00 (until Dec 4, 2025)
       $39.00 (after Dec 5, 2025)
Type: Subscription (Annual)
Billing: Charge once per year
Trial: None

Includes:
  - All 16 city guides
  - AI Travel Planner access
  - Priority support
```

---

## 🗄️ Supabase Database Schema

### Table: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  
  -- Tier & Access
  tier TEXT NOT NULL DEFAULT 'free',  
  -- Values: 'free', 'single', 'bundle', 'member'
  
  membership_status TEXT,  
  -- Values: 'active', 'expired', 'cancelled', null
  
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Purchase History
  purchased_guides JSONB DEFAULT '[]'::jsonb,
  -- Example: ["dallas", "atlanta", "kansas-city", "boston"]
  
  bundle_purchased BOOLEAN DEFAULT false,
  
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  -- Running total of all purchases
  
  -- Engagement Tracking
  ai_planner_uses INT DEFAULT 0,
  forum_posts INT DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,
  referral_code TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_user_profiles_membership_status ON user_profiles(membership_status);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Table: `purchases`
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Lemon Squeezy Data
  order_id TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_id TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Product Details
  product_type TEXT NOT NULL,
  -- Values: 'single_guide', 'bundle', 'membership'
  
  cities_purchased JSONB,
  -- Example: ["dallas", "atlanta", "kansas-city", "boston"]
  
  -- Status
  status TEXT DEFAULT 'completed',
  -- Values: 'pending', 'completed', 'refunded'
  
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_order_id ON purchases(order_id);

-- Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔐 Access Control Logic

### Middleware: Route Protection
```javascript
// middleware.js or app middleware
import { createServerClient } from '@supabase/ssr'

export async function middleware(request) {
  const supabase = createServerClient(/* config */)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Not logged in
    const protectedRoutes = ['/planner', '/forums', '/profile']
    if (protectedRoutes.some(route => request.url.includes(route))) {
      return Response.redirect(new URL('/login', request.url))
    }
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tier, membership_status, purchased_guides')
    .eq('user_id', user.id)
    .single()
  
  // AI Planner - Members Only
  if (request.url.includes('/planner') && profile.tier !== 'member') {
    return Response.redirect(
      new URL('/upgrade?reason=ai_planner', request.url)
    )
  }
  
  // Forums - All paid tiers + free
  // (Currently open to all logged-in users per your spec)
  
  // Guide Download - Check ownership
  if (request.url.includes('/download/')) {
    const citySlug = extractCityFromUrl(request.url)
    
    // Dallas is always free
    if (citySlug === 'dallas') {
      return NextResponse.next()
    }
    
    // Check if user owns this guide
    const hasAccess = 
      profile.tier === 'member' ||
      profile.purchased_guides?.includes(citySlug)
    
    if (!hasAccess) {
      return Response.redirect(
        new URL(`/upgrade?city=${citySlug}`, request.url)
      )
    }
  }
  
  return NextResponse.next()
}
```

---

### Function: Check Guide Access
```javascript
// lib/access-control.js

export function canAccessGuide(userProfile, citySlug) {
  // Dallas is always free
  if (citySlug === 'dallas') return true
  
  // Members get all guides
  if (userProfile.tier === 'member') return true
  
  // Check if user purchased this specific guide
  if (userProfile.purchased_guides?.includes(citySlug)) return true
  
  return false
}

export function canAccessAIPlanner(userProfile) {
  return userProfile.tier === 'member' && 
         userProfile.membership_status === 'active'
}

export function canAccessForums(userProfile) {
  // All logged-in users can access forums (per your spec)
  return true
}

export function canAccessPrioritySupport(userProfile) {
  return userProfile.tier === 'member' && 
         userProfile.membership_status === 'active'
}
```

---

## 💎 Upsell & Credit System

### Upgrade Pricing Logic
```javascript
// lib/upsell-logic.js

export function calculateUpgradePrice(currentProfile) {
  const { tier, total_spent, purchased_guides } = currentProfile
  
  const prices = {
    single: 3.99,
    bundle: 9.99,
    member: 29.00  // Early bird price
  }
  
  // User bought 1 single guide → Bundle upgrade
  if (tier === 'single' && purchased_guides.length === 1) {
    return {
      offer: 'bundle',
      price: prices.bundle - prices.single,
      display: '$6.00',
      message: 'Add 3 more cities for just $6',
      savings: prices.single
    }
  }
  
  // User bought 2+ single guides → Member upgrade
  if (tier === 'single' && purchased_guides.length >= 2) {
    const spent = purchased_guides.length * prices.single
    return {
      offer: 'member',
      price: prices.member - spent,
      display: `$${(prices.member - spent).toFixed(2)}`,
      message: 'Get ALL 16 cities + AI Planner',
      savings: spent
    }
  }
  
  // User bought bundle → Member upgrade
  if (tier === 'bundle') {
    return {
      offer: 'member',
      price: prices.member - prices.bundle,
      display: '$19.01',
      message: 'Add AI Planner + 12 more guides for $19',
      savings: prices.bundle,
      features: ['Unlimited AI itineraries', '+12 city guides', 'Priority support']
    }
  }
  
  // No upgrade available
  return null
}
```

---

### UI: Upsell Banner Component
```jsx
// components/UpsellBanner.jsx

export function UpsellBanner({ userProfile }) {
  const upgrade = calculateUpgradePrice(userProfile)
  
  if (!upgrade) return null
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-2">
            💎 Unlock More Value
          </h3>
          <p className="text-gray-700 mb-2">
            {upgrade.message}
          </p>
          {upgrade.features && (
            <ul className="text-sm text-gray-600 space-y-1">
              {upgrade.features.map(feature => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">
            {upgrade.display}
          </div>
          <div className="text-sm text-gray-500 line-through">
            ${upgrade.price + upgrade.savings}
          </div>
          <a 
            href={`/checkout?upgrade=${upgrade.offer}`}
            className="mt-3 inline-block px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔗 Webhook Integration

### Lemon Squeezy → Supabase Webhook

**Endpoint:** `POST /api/webhooks/lemon-squeezy`
```javascript
// app/api/webhooks/lemon-squeezy/route.js

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role for admin access
)

export async function POST(request) {
  // Verify webhook signature
  const signature = request.headers.get('X-Signature')
  const body = await request.text()
  
  const isValid = verifySignature(body, signature)
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }
  
  const event = JSON.parse(body)
  
  // Handle order_created event
  if (event.meta.event_name === 'order_created') {
    await handleOrderCreated(event.data)
  }
  
  // Handle subscription events
  if (event.meta.event_name === 'subscription_created') {
    await handleSubscriptionCreated(event.data)
  }
  
  if (event.meta.event_name === 'subscription_updated') {
    await handleSubscriptionUpdated(event.data)
  }
  
  if (event.meta.event_name === 'subscription_cancelled') {
    await handleSubscriptionCancelled(event.data)
  }
  
  return new Response('Webhook processed', { status: 200 })
}

function verifySignature(body, signature) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return hash === signature
}

async function handleOrderCreated(data) {
  const {
    id: order_id,
    attributes: {
      user_email: email,
      first_order_item: {
        product_id,
        product_name,
        variant_id,
        price
      },
      total,
      custom_data
    }
  } = data
  
  // Determine product type and cities
  const { productType, cities } = parseProduct(product_id, custom_data)
  
  // Create or update user profile
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single()
  
  if (existingProfile) {
    // Update existing profile
    await updateProfileAfterPurchase(
      existingProfile,
      productType,
      cities,
      total
    )
  } else {
    // Create new profile
    await createProfileAfterPurchase(
      email,
      productType,
      cities,
      total
    )
  }
  
  // Record purchase
  await supabase
    .from('purchases')
    .insert({
      order_id,
      email,
      product_id,
      product_name,
      variant_id,
      amount: total / 100,  // Convert cents to dollars
      product_type: productType,
      cities_purchased: cities,
      status: 'completed'
    })
  
  // Send welcome email
  await sendPurchaseConfirmationEmail(email, productType, cities)
}

function parseProduct(product_id, custom_data) {
  // Single city guide
  if (product_id === 'single_city_guide') {
    return {
      productType: 'single_guide',
      cities: [custom_data.city_selection]
    }
  }
  
  // 4-city bundle
  if (product_id === 'bundle_4city') {
    return {
      productType: 'bundle',
      cities: [
        custom_data.city_1,
        custom_data.city_2,
        custom_data.city_3,
        custom_data.city_4
      ]
    }
  }
  
  // Membership
  if (product_id === 'membership_annual') {
    return {
      productType: 'membership',
      cities: null  // Members get all cities
    }
  }
}

async function updateProfileAfterPurchase(profile, productType, cities, amount) {
  let updates = {
    total_spent: profile.total_spent + (amount / 100)
  }
  
  if (productType === 'single_guide') {
    updates.tier = 'single'
    updates.purchased_guides = [
      ...new Set([...profile.purchased_guides, ...cities])
    ]
  }
  
  if (productType === 'bundle') {
    updates.tier = 'bundle'
    updates.bundle_purchased = true
    updates.purchased_guides = [
      ...new Set([...profile.purchased_guides, ...cities])
    ]
  }
  
  if (productType === 'membership') {
    updates.tier = 'member'
    updates.membership_status = 'active'
    updates.membership_expires_at = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000  // 1 year from now
    )
  }
  
  await supabase
    .from('user_profiles')
    .update(updates)
    .eq('email', profile.email)
}

async function createProfileAfterPurchase(email, productType, cities, amount) {
  let tier = 'free'
  let purchased_guides = []
  let bundle_purchased = false
  let membership_status = null
  let membership_expires_at = null
  
  if (productType === 'single_guide') {
    tier = 'single'
    purchased_guides = cities
  }
  
  if (productType === 'bundle') {
    tier = 'bundle'
    purchased_guides = cities
    bundle_purchased = true
  }
  
  if (productType === 'membership') {
    tier = 'member'
    membership_status = 'active'
    membership_expires_at = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    )
  }
  
  await supabase
    .from('user_profiles')
    .insert({
      email,
      tier,
      purchased_guides,
      bundle_purchased,
      membership_status,
      membership_expires_at,
      total_spent: amount / 100
    })
}

async function handleSubscriptionCreated(data) {
  // Similar to order_created but for subscriptions
  // Update membership_status = 'active'
}

async function handleSubscriptionUpdated(data) {
  // Handle renewals, changes
  // Update membership_expires_at
}

async function handleSubscriptionCancelled(data) {
  const { user_email } = data.attributes
  
  await supabase
    .from('user_profiles')
    .update({
      membership_status: 'cancelled'
      // Keep tier as 'member' until expiration date
    })
    .eq('email', user_email)
}
```

---

## ✅ Implementation Checklist

### Phase 1: Database Setup (Day 1)
- [ ] Create `user_profiles` table in Supabase
- [ ] Create `purchases` table in Supabase
- [ ] Set up Row Level Security policies
- [ ] Create indexes
- [ ] Test table creation and constraints

### Phase 2: Lemon Squeezy Setup (Day 1-2)
- [ ] Create Product: Dallas Guide (Free) - $0
- [ ] Create Product: Single City Guide - $3.99
  - [ ] Add 16 variants (one per city) OR custom field selector
- [ ] Create Product: 4-City Bundle - $9.99
  - [ ] Add custom fields: city_1, city_2, city_3, city_4
- [ ] Create Product: Fan Zone+ Membership - $29/year
  - [ ] Set up annual subscription billing
- [ ] Configure webhook endpoint URL
- [ ] Generate webhook signing secret
- [ ] Test webhook with Lemon Squeezy's test mode

### Phase 3: Webhook Implementation (Day 2)
- [ ] Create `/api/webhooks/lemon-squeezy` endpoint
- [ ] Implement signature verification
- [ ] Implement `handleOrderCreated()`
- [ ] Implement `handleSubscriptionCreated()`
- [ ] Implement `handleSubscriptionUpdated()`
- [ ] Implement `handleSubscriptionCancelled()`
- [ ] Test with Lemon Squeezy test orders
- [ ] Monitor webhook logs for errors

### Phase 4: Access Control (Day 2-3)
- [ ] Implement middleware for route protection
- [ ] Create `lib/access-control.js` helper functions
- [ ] Gate AI Planner (members only)
- [ ] Gate PDF downloads (ownership check)
- [ ] Gate forums (logged-in users)
- [ ] Test access control with different user tiers

### Phase 5: Upsell System (Day 3)
- [ ] Implement `calculateUpgradePrice()` logic
- [ ] Create `UpsellBanner` component
- [ ] Display upsells on dashboard
- [ ] Display upsells after single guide purchase
- [ ] Create upgrade checkout flow with credits
- [ ] Test upgrade paths (single → bundle → member)

### Phase 6: User Profile UI (Day 3-4)
- [ ] Create `/profile` page
- [ ] Display user's tier and purchased guides
- [ ] Show membership expiration date
- [ ] Add "Upgrade" CTA for non-members
- [ ] Add "Download My Guides" section
- [ ] Show AI Planner usage stats (if member)

### Phase 7: Pricing Page (Day 4)
- [ ] Create `/pricing` page with 4 tiers
- [ ] Add comparison table at bottom
- [ ] Add social proof badges ("2,143 members")
- [ ] Add FAQ section
- [ ] Mobile-responsive design
- [ ] Link tier cards to Lemon Squeezy checkout

### Phase 8: Email Confirmations (Day 4-5)
- [ ] Welcome email for free users
- [ ] Purchase confirmation email (single guide)
- [ ] Purchase confirmation email (bundle)
- [ ] Welcome email for new members
- [ ] Membership renewal reminder (30 days before expiry)
- [ ] Membership expired notification

### Phase 9: Testing (Day 5)
- [ ] Test free user signup flow
- [ ] Test single guide purchase → access granted
- [ ] Test bundle purchase → 4 cities accessible
- [ ] Test membership purchase → all features unlocked
- [ ] Test upsell offers display correctly
- [ ] Test webhook error handling
- [ ] Test access denial for unpaid content

### Phase 10: Analytics & Monitoring (Day 5-6)
- [ ] Set up Supabase analytics queries
- [ ] Create admin dashboard to view:
  - User count by tier
  - Revenue by tier
  - Conversion rates
  - Most popular cities
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Create alerts for webhook failures

### Phase 11: Launch Prep (Day 6-7)
- [ ] Document user flows for support team
- [ ] Create refund policy page
- [ ] Create terms of service
- [ ] Create privacy policy
- [ ] Test entire flow end-to-end
- [ ] Soft launch to waitlist (100 users)
- [ ] Monitor for issues
- [ ] Public launch 🚀

---

## 🎯 Critical Environment Variables
```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=your-api-key
LEMON_SQUEEZY_STORE_ID=your-store-id
LEMON_SQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Product IDs
LEMON_SQUEEZY_PRODUCT_SINGLE_GUIDE=product_xxx
LEMON_SQUEEZY_PRODUCT_BUNDLE=product_yyy
LEMON_SQUEEZY_PRODUCT_MEMBERSHIP=product_zzz

# Email (for confirmations)
RESEND_API_KEY=your-resend-key
FROM_EMAIL=hello@worldcup26fanzone.com

# Base URL
NEXT_PUBLIC_BASE_URL=https://worldcup26fanzone.com
```

---

## 📊 Success Metrics

**Track these KPIs:**

| Metric | Target (Dec 5 - Jan 31) |
|--------|-------------------------|
| Free → Paid conversion | 15-20% |
| Single → Bundle upgrade | 30% |
| Bundle → Member upgrade | 20% |
| Direct to Member | 10% |
| Total revenue | $50K-75K |
| Average order value | $18-22 |
| Member retention (1 year) | 80%+ |

---

## 🐛 Common Issues & Solutions

### Issue: Webhook not receiving events
**Solution:** 
- Check Lemon Squeezy webhook URL is correct
- Verify webhook secret matches environment variable
- Check webhook logs in Lemon Squeezy dashboard
- Test with Lemon Squeezy's webhook tester

### Issue: User purchased but doesn't have access
**Solution:**
- Check `purchases` table for order record
- Verify `user_profiles.tier` updated correctly
- Check `purchased_guides` array populated
- Manual fix: Update profile directly in Supabase

### Issue: Upsell pricing incorrect
**Solution:**
- Verify `total_spent` field accurate
- Check `calculateUpgradePrice()` logic
- Ensure webhook properly updates `total_spent`

### Issue: User can't download guide they purchased
**Solution:**
- Check `canAccessGuide()` function logic
- Verify city slug matches exactly (case-sensitive)
- Check `purchased_guides` array format
- Ensure middleware isn't blocking incorrectly

---

## 🔄 Future Enhancements

**Post-launch improvements to consider:**

1. **Monthly membership option** ($3.99/month = $48/year)
2. **Gift memberships** (buy for a friend)
3. **Team/group discounts** (5+ members)
4. **Affiliate program** (earn 20% commission)
5. **Lifetime membership** ($199 one-time)
6. **Premium tier** ($99/year with concierge support)
7. **Bundle customization** (choose 2, 3, 5, or 6 cities)
8. **Pay-what-you-want** option for free users
9. **Cryptocurrency payments** (via Lemon Squeezy)
10. **Referral rewards** ($5 credit per referral)

---

## 📞 Support & Troubleshooting

**For implementation questions:**
- Supabase Docs: https://supabase.com/docs
- Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware

**For webhook testing:**
- Use Lemon Squeezy's webhook testing tool
- Test with ngrok for local development: `ngrok http 3000`

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2024  
**Next Review:** Before public launch (Dec 2025)

---

**End of Document**