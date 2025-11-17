import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export const PROTECTED_ROUTES = [
  '/planner/trip-builder',
  // Actual app routes
  '/lodging-planner',
  '/flight-planner',
  // Future/alias paths (covered just in case)
  '/planner/lodging-planner',
  '/planner/flight-planner',
  '/onboarding'
]

export async function checkMembership(): Promise<{
  isMember: boolean
  email: string | null
  userId: string | null
}> {
  try {
    console.log('[MEM] checkMembership() start');
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('[MEM] No user in checkMembership');
      return { isMember: false, email: null, userId: null }
    }
    
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('is_member, email')
      .eq('user_id', user.id)
      .single()

    console.log('[MEM] Profile fetch', { userId: user.id, profile, profErr })

    return {
      isMember: profile?.is_member ?? false,
      email: profile?.email ?? user.email ?? null,
      userId: user.id
    }
  } catch (error) {
    console.error('[MEM] Error checking membership:', error)
    return { isMember: false, email: null, userId: null }
  }
}

/**
 * Check if a user is an active member using a Supabase client (typically Service Role).
 * This function bypasses RLS when using supabaseAdmin.
 */
export async function isActiveMember(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member')
      .eq('user_id', userId)
      .single()
    
    return profile?.is_member ?? false
  } catch (error) {
    console.error('Error checking active membership:', error)
    return false
  }
}
