import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { threadId } = body;
    if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 });

    // Get the access token from cookies (Supabase stores session in cookies)
    const cookie = req.headers.get('cookie') || '';

    // Use the server client to get the user from the cookie/session
    const { data: sessionData } = await supabaseServer.auth.getSession();
    // When using service role client, auth.getSession() won't read the cookie; instead, parse the cookie for access token if present
    // As a fallback require an X-Admin-Secret header (for scripted/admin requests)

    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET) {
      // allow
    } else {
      // Try to validate via bearer token from Authorization header
      const authHeader = req.headers.get('authorization');
      let userId: string | null = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        // create a transient client to get user
        const client = supabaseServer;
        const { data: ud } = await client.auth.getUser(token);
        userId = ud.user?.id ?? null;
      }

      if (!userId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
      }

      // check roles in profiles
      const { data: profiles } = await supabaseServer
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      const role = (profiles as any)?.role ?? 'user';
      if (!['admin', 'moderator', 'superadmin'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden - requires moderator/admin' }, { status: 403 });
      }
    }

    // Perform delete using service role client (supabaseServer has the service key)
    const { error } = await supabaseServer.from('threads').delete().eq('id', threadId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
