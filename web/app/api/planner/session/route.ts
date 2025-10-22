import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function getAuthenticatedSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: async (key: string) => {
          const cookie = cookieStore.get(key);
          return cookie?.value ?? null;
        },
        setItem: async () => {},
        removeItem: async () => {},
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  return { supabase, user, authError };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const { supabase, user, authError } = await getAuthenticatedSupabase();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    // 2. Get session_id from query params (optional)
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    // 3. Fetch trip session
    let query = supabase
      .from('trip_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (sessionId) {
      query = query.eq('id', sessionId);
    } else {
      query = query.order('updated_at', { ascending: false }).limit(1);
    }

    const { data: session, error: sessionError } = await query.single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No trip session found' }, { status: 404 });
    }

    // 4. Return complete session data
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        user_id: session.user_id,
        trip_context: session.trip_context,
        flights_data: session.flights_data,
        lodging_data: session.lodging_data,
        ground_data: session.ground_data,
        created_at: session.created_at,
        updated_at: session.updated_at,
      },
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trip session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate
    const { supabase, user, authError } = await getAuthenticatedSupabase();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    // 2. Get session_id from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // 3. Delete session (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('trip_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip session' },
      { status: 500 }
    );
  }
}

