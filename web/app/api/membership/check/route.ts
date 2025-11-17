import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
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
