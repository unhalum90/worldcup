import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isActiveMember } from '@/lib/membership';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const token = url.searchParams.get('token') || req.headers.get('x-admin-token') || '';
  const expectedToken = process.env.ADMIN_TEST_TOKEN || '';

  if (!expectedToken) {
    return NextResponse.json(
      { error: 'ADMIN_TEST_TOKEN is not configured in the environment' },
      { status: 500 }
    );
  }

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id query param' }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();

    const active = await isActiveMember(supabase, userId);

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id,id,email,is_member,account_level,subscription_tier,subscription_status,subscription_cancels_at,subscription_renews_at')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    const { data: purchases } = await supabase
      .from('purchases')
      .select('id,user_id,email,product_id,status,ls_order_id,price,currency,purchase_date')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })
      .limit(10);

    return NextResponse.json({
      ok: true,
      userId,
      active,
      profile: profile || null,
      purchases: purchases || [],
    });
  } catch (error: any) {
    console.error('admin/test-membership error', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

