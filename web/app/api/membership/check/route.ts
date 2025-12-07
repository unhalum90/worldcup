import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    // First get the authenticated user from the session (cookie-based)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isMember: false })
    }

    // Use service role to bypass RLS and check membership
    const { data: profile } = await supabaseServer
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
