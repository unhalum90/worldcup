# Complete Paywall System - From Scratch

## Step 1: Supabase Utilities

### `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Admin client for bypassing RLS
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined
        },
      },
    }
  )
}
```

### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Step 2: Membership Utilities

### `lib/membership.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function checkMembership(): Promise<{
  isMember: boolean
  email: string | null
  userId: string | null
}> {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { isMember: false, email: null, userId: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member, email')
      .eq('user_id', user.id)
      .single()

    return {
      isMember: profile?.is_member || false,
      email: profile?.email || user.email || null,
      userId: user.id
    }
  } catch (error) {
    console.error('Membership check error:', error)
    return { isMember: false, email: null, userId: null }
  }
}

export const PROTECTED_ROUTES = [
  '/planner/trip-builder',
  '/planner/lodging',
  '/planner/flights',
]

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}
```

---

## Step 3: Middleware (Route Protection)

### `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_ROUTES = [
  '/planner/trip-builder',
  '/planner/lodging',
  '/planner/flights',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  
  if (!isProtected) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = new URL('/membership', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check membership
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_member')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_member) {
    const redirectUrl = new URL('/membership', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/planner/trip-builder/:path*',
    '/planner/lodging/:path*',
    '/planner/flights/:path*',
  ]
}
```

---

## Step 4: Checkout API

### `app/api/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Must be logged in' },
        { status: 401 }
      )
    }

    const storeId = process.env.LEMON_STORE_ID
    const productId = process.env.LEMON_MEMBER_PRODUCT_IDS?.split(',')[0]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!storeId || !productId) {
      return NextResponse.json(
        { error: 'Store not configured' },
        { status: 500 }
      )
    }

    // Create Lemon Squeezy checkout
    const checkoutUrl = new URL(`https://worldcup26fanzone.lemonsqueezy.com/checkout/buy/${productId}`)
    
    checkoutUrl.searchParams.set('checkout[email]', user.email)
    checkoutUrl.searchParams.set('checkout[custom][user_id]', user.id)
    
    // Success URL goes to activation page
    checkoutUrl.searchParams.set(
      'checkout[success_url]',
      `${siteUrl}/membership/activate?session_id={session_id}`
    )

    return NextResponse.json({ 
      url: checkoutUrl.toString() 
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
```

---

## Step 5: Membership Check API

### `app/api/membership/check/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isMember: false })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member, member_since')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      isMember: profile?.is_member || false,
      memberSince: profile?.member_since || null
    })

  } catch (error) {
    console.error('Membership check error:', error)
    return NextResponse.json({ isMember: false })
  }
}
```

---

## Step 6: Activation API

### `app/api/membership/activate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, orderId } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LEMON_API_KEY
    const memberProductIds = (process.env.LEMON_MEMBER_PRODUCT_IDS || '')
      .split(',')
      .map(id => id.trim())

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Checking purchases for:', email)

    // Check Lemon Squeezy for orders
    const url = new URL('https://api.lemonsqueezy.com/v1/orders')
    url.searchParams.set('filter[user_email]', email)
    url.searchParams.set('filter[status]', 'paid')

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.error('Lemon API error:', response.status)
      return NextResponse.json(
        { error: 'Failed to verify purchase' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const orders = data.data || []

    console.log(`📦 Found ${orders.length} orders`)

    // Find a valid membership order
    const validOrder = orders.find((order: any) => {
      const productId = String(order.attributes?.first_order_item?.product_id || '')
      return memberProductIds.includes(productId)
    })

    if (!validOrder) {
      console.log('❌ No valid membership order found')
      return NextResponse.json({
        success: false,
        message: 'No membership purchase found for this email'
      })
    }

    console.log('✅ Valid order found:', validOrder.id)

    // Update profile using admin client (bypasses RLS)
    const supabase = createAdminClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_member: true,
        member_since: new Date().toISOString(),
        ls_customer_id: validOrder.attributes?.customer_id,
      })
      .eq('email', email)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to activate membership' },
        { status: 500 }
      )
    }

    // Record purchase
    const purchaseData = {
      email,
      ls_order_id: validOrder.id,
      product_id: String(validOrder.attributes?.first_order_item?.product_id),
      product_name: validOrder.attributes?.first_order_item?.product_name,
      price: validOrder.attributes?.total ? Number(validOrder.attributes.total) / 100 : null,
      currency: validOrder.attributes?.currency || 'USD',
      status: 'completed',
      payload: validOrder,
    }

    await supabase
      .from('purchases')
      .upsert(purchaseData, { onConflict: 'ls_order_id' })

    console.log('✅ Membership activated for:', email)

    return NextResponse.json({
      success: true,
      message: 'Membership activated successfully'
    })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 }
    )
  }
}
```

---

## Step 7: Membership Sales Page

### `app/membership/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MembershipPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login
        router.push('/login?redirect=/membership')
        return
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      // Redirect to Lemon Squeezy
      window.location.href = url

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          World Cup 2026 Trip Builder
        </h1>
        <p className="text-xl text-gray-600">
          Plan your perfect World Cup experience with AI-powered trip planning
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="mb-6">
          <div className="text-5xl font-bold mb-2">$29</div>
          <div className="text-gray-600">One-time payment • Lifetime access</div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Complete city guides for all 16 host cities</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI-powered personalized trip planning</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Flight and lodging recommendations</span>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Match day planning tools (available June 2026)</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Access Now'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Secure checkout powered by Lemon Squeezy
        </p>
      </div>

      <div className="text-center">
        <a href="/membership/activate" className="text-blue-600 hover:underline">
          Already purchased? Activate your membership →
        </a>
      </div>
    </div>
  )
}
```

---

## Step 8: Activation Page

### `app/membership/activate/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ActivatePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Auto-activate if coming from checkout
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      autoActivate()
    }
  }, [searchParams])

  const autoActivate = async () => {
    setLoading(true)
    setMessage('Verifying your purchase...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setMessage('Please log in to activate your membership')
        setLoading(false)
        return
      }

      await activateMembership(user.email)

    } catch (error) {
      console.error('Auto-activation error:', error)
      setMessage('Error activating membership. Please try manually below.')
      setLoading(false)
    }
  }

  const activateMembership = async (emailToUse: string) => {
    setLoading(true)
    setMessage('Checking for purchases...')

    try {
      const response = await fetch('/api/membership/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Membership activated! Redirecting...')
        
        // Refresh session
        const supabase = createClient()
        await supabase.auth.refreshSession()

        // Redirect to planner
        setTimeout(() => {
          router.push('/planner/trip-builder')
        }, 2000)
      } else {
        setMessage(result.message || 'No purchase found for this email')
        setLoading(false)
      }

    } catch (error) {
      console.error('Activation error:', error)
      setMessage('Error activating membership. Please contact support.')
      setLoading(false)
    }
  }

  const handleManualActivation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await activateMembership(email)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Activate Your Membership
        </h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && !message.includes('✅') && (
          <>
            <p className="text-gray-600 mb-6 text-center">
              If you just completed your purchase, we'll activate your membership automatically.
              If not, enter the email you used at checkout below.
            </p>

            <form onSubmit={handleManualActivation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Checkout Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Activate Membership
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/membership" className="text-blue-600 hover:underline">
                ← Back to membership page
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## Step 9: Protected Page Example

### `app/planner/trip-builder/page.tsx`

```typescript
import { checkMembership } from '@/lib/membership'
import { redirect } from 'next/navigation'

export default async function TripBuilderPage() {
  // Server-side check (belt and suspenders with middleware)
  const { isMember } = await checkMembership()

  if (!isMember) {
    redirect('/membership?redirect=/planner/trip-builder')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Trip Builder</h1>
      {/* Your trip builder content */}
      <p>Welcome to the trip builder! You have access.</p>
    </div>
  )
}
```

---

## Testing Checklist

### 1. Test Non-Member Flow:
- [ ] Visit `/planner/trip-builder` → Should redirect to `/membership`
- [ ] Click "Get Access Now" → Should redirect to Lemon Squeezy

### 2. Test Purchase Flow:
- [ ] Complete purchase on Lemon Squeezy
- [ ] Should redirect to `/membership/activate`
- [ ] Should show "Verifying purchase..." then "Membership activated!"
- [ ] Should redirect to `/planner/trip-builder`
- [ ] Should have full access

### 3. Test Manual Activation:
- [ ] Go to `/membership/activate` directly
- [ ] Enter purchase email
- [ ] Click "Activate Membership"
- [ ] Should activate and redirect

### 4. Test Already-Member:
- [ ] Visit `/planner/trip-builder` as member
- [ ] Should load immediately (no redirect)

---

## Common Issues & Fixes

### Issue: "No purchase found"
**Fix:** Check that `LEMON_MEMBER_PRODUCT_IDS` matches your actual product IDs

### Issue: Middleware redirecting members
**Fix:** Check that `profiles.is_member` is actually `true` in database

### Issue: Activation not working
**Fix:** Check Vercel logs for API errors, verify `LEMON_API_KEY` is set

### Issue: Checkout not redirecting back
**Fix:** Verify `NEXT_PUBLIC_SITE_URL` is set correctly

---

## Why This Works

1. **Middleware**: Blocks access before page loads
2. **Server-side check**: Double verification in page component
3. **Client-side activation**: Works immediately after purchase
4. **No webhook dependency**: Direct API verification
5. **Simple database**: One boolean flag (`is_member`)

---

## Next Steps

1. Deploy this system
2. Test with a real purchase ($1 test product)
3. Once working, add webhook as backup (optional)
4. Monitor Vercel logs for any errors

This is the simplest system that will actually work. No complexity, no webhooks required, no middleware bugs.