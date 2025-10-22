import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your trip data.' },
        { status: 401 }
      );
    }

    // Get session ID from query params if provided, otherwise get latest
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

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
      return NextResponse.json(
        { error: 'No trip session found.' },
        { status: 404 }
      );
    }

    // Calculate completion status
    const completionStatus = {
      overview: !!session.trip_context,
      flights: !!session.flights_data,
      lodging: !!session.lodging_data,
      ground: !!session.ground_data
    };

    const percentComplete = Object.values(completionStatus).filter(Boolean).length * 25;

    return NextResponse.json({ 
      success: true,
      session: {
        id: session.id,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        tripContext: session.trip_context,
        flights: session.flights_data,
        lodging: session.lodging_data,
        ground: session.ground_data,
        completionStatus,
        percentComplete
      }
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trip session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('trip_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id); // Ensure user owns this session

    if (deleteError) {
      console.error('Failed to delete session:', deleteError);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
