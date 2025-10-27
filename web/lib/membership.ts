// Lightweight membership helpers to enable future gating without enforcing it yet.
// These functions are safe to import in server routes or middleware.
// They default to conservative values if the subscriptions table or fields are not present.

export type SubscriptionRecord = {
  id: string
  user_id: string
  status?: string | null
  current_period_end?: string | null
  plan?: string | null
  [key: string]: any
}

/**
 * Return the active subscription row for a user if present.
 * Looks for a `subscriptions` table with columns { user_id, status } and treats
 * status in ('active','trialing','past_due') as active-ish by default.
 */
export async function getActiveSubscription(supabase: any, userId: string): Promise<SubscriptionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table may not exist yet; surface no subscription rather than throwing.
      return null;
    }
    return data || null;
  } catch {
    return null;
  }
}

/**
 * True if user has an active subscription. Safe default is false.
 */
export async function isActiveMember(supabase: any, userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(supabase, userId);
  return !!sub;
}
