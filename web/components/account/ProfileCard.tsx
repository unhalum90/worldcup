"use client"

import Image from 'next/image'

type Profile = {
  user_id: string
  email?: string | null
  name?: string | null
  avatar_url?: string | null
  account_level?: 'free' | 'city_bundle' | 'member'
  subscription_tier?: 'free' | 'premium' | 'pro'
  subscription_status?: 'active' | 'cancelled' | 'expired' | 'trialing'
}

export default function ProfileCard({ profile, user }: { profile: Profile | null; user: any }) {
  const email = profile?.email || user?.email || ''
  const name = profile?.name || user?.user_metadata?.name || ''
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const level = profile?.account_level || 'free'
  const tier = profile?.subscription_tier || 'free'
  const status = profile?.subscription_status || 'active'

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">👤</div>
        )}
      </div>
      <div>
        <div className="text-base font-medium">{name || 'Anonymous'}</div>
        <div className="text-sm text-gray-500">{email}</div>
        <div className="mt-1 text-sm">Account: <span className="font-medium capitalize">{level}</span></div>
        <div className="text-xs text-gray-500">Tier: {tier} • Status: {status}</div>
      </div>
    </div>
  )
}
