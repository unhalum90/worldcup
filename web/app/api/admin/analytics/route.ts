import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { createServerClient, supabaseServer } from '@/lib/supabaseServer';

function normalizeToHttps(u: string): string {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return u.replace(/^http:\/\//i, 'https://');
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the caller using Supabase cookies
    const supabaseAuth = createSSRClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
          set() {},
          remove() {},
        },
      }
    );

    const { data: userData } = await supabaseAuth.auth.getUser();
    const user = userData.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional email allowlist via env
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = (user.email || '').toLowerCase();
    if (adminEmails.length > 0 && !adminEmails.includes(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Role check via service client (profiles.role === 'admin')
    try {
      const svc = supabaseServer;
      const { data: profile } = await svc
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (e) {
      // If profiles table is not present, fall back to email allowlist only
    }

    // Fetch analytics snapshot from view
    const svc = supabaseServer;
    const { data, error } = await svc
      .from('analytics_overview')
      .select('*')
      .single();

    if (error || !data) {
      console.error('analytics_overview query failed:', error);
      return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }

    return NextResponse.json({ stats: data }, { status: 200 });
  } catch (e) {
    console.error('GET /api/admin/analytics error', e);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

