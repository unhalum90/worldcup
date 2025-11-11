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

  const { data: profile } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

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
