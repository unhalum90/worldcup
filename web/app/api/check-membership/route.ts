import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseServer';
import { isActiveMember } from '@/lib/membership';

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

export async function GET(_req: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // No-op: read-only in this endpoint
          },
          remove() {
            // No-op: read-only in this endpoint
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabaseAuth.auth.getSession();

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ isMember: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const isMember = await isActiveMember(supabaseServer, userId);

    return NextResponse.json({ isMember });
  } catch (error) {
    console.error('Error checking membership status:', error);
    return new NextResponse(
      JSON.stringify({ isMember: false, error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
