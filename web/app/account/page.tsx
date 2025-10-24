import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileCard from '../../components/account/ProfileCard'
import PurchasesTable from '../../components/account/PurchasesTable'
import SubscriptionCard from '../../components/account/SubscriptionCard'
import NotificationsCard from '../../components/account/NotificationsCard'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  let { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', user.id)
    .order('purchase_date', { ascending: false })

  if ((!purchases || purchases.length === 0) && profile?.email) {
    const res = await supabase
      .from('purchases')
      .select('*')
      .eq('email', profile.email)
      .order('purchase_date', { ascending: false })
    purchases = res.data || []
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white/5 p-4">
            <ProfileCard profile={profile} user={user} />
          </div>

          <div className="rounded-lg border bg-white/5 p-4">
            <h2 className="text-lg font-medium mb-3">Purchases</h2>
            <PurchasesTable purchases={purchases || []} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-white/5 p-4">
            <h2 className="text-lg font-medium mb-3">Subscription</h2>
            <SubscriptionCard />
          </div>

          <div className="rounded-lg border bg-white/5 p-4">
            <h2 className="text-lg font-medium mb-3">Notifications</h2>
            <NotificationsCard email={profile?.email || user.email || ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
