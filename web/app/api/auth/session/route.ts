import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing for auth/session route');
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { event, session } = body as { event: string; session: any };

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    normalizeToHttps(supabaseUrl),
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      if (!session) {
        return NextResponse.json({ error: 'session_missing' }, { status: 400 });
      }
      await supabase.auth.setSession(session);
    } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn('Supabase signOut during session sync failed', signOutError);
      }
    }
  } catch (error) {
    console.error('Failed to sync Supabase auth cookies', error);
    return NextResponse.json({ error: 'session_sync_failed' }, { status: 500 });
  }

  return response;
}
