import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/account/ProfileCard'
import SavedTripsCard from '@/components/account/SavedTripsCard'
import PurchasesTable from '@/components/account/PurchasesTable'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userProfile } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Load membership flags from public.profiles to display accurate account status
  const { data: membershipProfile } = await supabase
    .from('profiles')
    .select('account_level, subscription_tier, subscription_status, is_member, email')
    .eq('user_id', user.id)
    .maybeSingle()

  // Merge into a single object for the card (prefer explicit membership flags from profiles)
  const profile = {
    ...(userProfile || {}),
    account_level: membershipProfile?.account_level ?? (userProfile as any)?.account_level ?? 'free',
    subscription_tier: membershipProfile?.subscription_tier ?? (userProfile as any)?.subscription_tier ?? 'free',
    subscription_status: membershipProfile?.subscription_status ?? (userProfile as any)?.subscription_status ?? 'active',
    is_member: membershipProfile?.is_member ?? (userProfile as any)?.is_member ?? false,
    email: membershipProfile?.email ?? (userProfile as any)?.email ?? user.email,
  } as any

  // Load purchases (RLS restricts to this user)
  const { data: purchases } = await supabase
    .from('purchases')
    .select('id, product_id, product_name, price, currency, status, purchase_date')
    .order('purchase_date', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white/5 p-4">
          <ProfileCard profile={profile} user={user} />
        </div>
        <SavedTripsCard />
        <div className="rounded-lg border bg-white/5 p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Purchases</h2>
            <p className="text-sm text-gray-600">Your guides, bundles, and memberships from Lemon Squeezy.</p>
          </div>
          <PurchasesTable purchases={purchases ?? []} />
        </div>
      </div>
    </div>
  )
}
