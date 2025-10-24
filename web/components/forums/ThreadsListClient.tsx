"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ThreadCard from '@/components/ThreadCard';
import type { Thread } from '@/types/forum';
import NewThreadForm from './NewThreadForm';
import QuickSignUp from './QuickSignUp';

type Props = {
  cityId?: string | null;
  citySlug: string;
};

export default function ThreadsListClient({ cityId, citySlug }: Props) {
  // reuse the singleton client from lib to avoid multiple GoTrueClient instances
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _supabase = supabase;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [resolvedCityId, setResolvedCityId] = useState<string | null>(cityId ?? null);
  const [showForm, setShowForm] = useState(false);
  const [sortOption, setSortOption] = useState<'newest'|'oldest'|'most_votes'|'least_votes'>('newest');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);

      // If the server didn't resolve cityId, fetch it by slug from REST
      if (!resolvedCityId && citySlug) {
        try {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?slug=eq.${citySlug}&select=id&limit=1`, {
            headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
            cache: 'no-store',
          });
          const list = await resp.json();
          if (Array.isArray(list) && list.length) {
            // set cityId for immediate use
            // note: this updates local state only
            setThreads([]); // reset
            setResolvedCityId(list[0].id);
          }
        } catch (e) {
          console.error('Error resolving cityId by slug', e);
        }
      }

      if (data.user) {
        // initial fetch will be handled by effect that watches resolvedCityId + filters
        if (resolvedCityId) fetchThreads();
      }
    }
    init();

    const { data: sub } = _supabase.auth.onAuthStateChange((event: string, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchThreads();
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [cityId]);

  async function fetchThreads() {
    setLoading(true);
    let query = supabase
      .from('threads')
      .select('*')
      .eq('city_id', resolvedCityId)
      .limit(50);

    // apply date filters if present (ISO date strings from date inputs)
    if (startDate) {
      // include the whole day for start
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      // include the whole day for end (set to end of day)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    // sorting
    switch (sortOption) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_votes':
        query = query.order('score', { ascending: false });
        break;
      case 'least_votes':
        query = query.order('score', { ascending: true });
        break;
    }

    const { data } = await query;
    const items = (data || []) as any[];
    // Pinned-first ordering (no DB dependency on a pinned column; safe if absent)
    const pinned = items.filter((t) => t.pinned === true);
    const others = items.filter((t) => !t.pinned);
    // Maintain current sort within each group (server applied), so just merge
    const ordered = [...pinned, ...others];
    setThreads(ordered);
    setLoading(false);
  }

  // refetch when filters or resolvedCityId change (and user is signed in)
  useEffect(() => {
    if (!resolvedCityId) return;
    let mounted = true;
    async function refetch() {
      setLoading(true);
      const { data } = await supabase
        .from('threads')
        .select('*')
        .eq('city_id', resolvedCityId)
        .limit(50);
      if (!mounted) return;
      // delegate to fetchThreads to apply full filters/sorting
      await fetchThreads();
      setLoading(false);
    }
    refetch();
    return () => { mounted = false; };
  }, [resolvedCityId, sortOption, startDate, endDate]);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Sending sign-in link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else setMessage('Check your email for a sign-in link.');
  }

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="p-4 border rounded bg-white">
          <p className="mb-2">You must be signed in to view forum threads for {citySlug}.</p>
          <form onSubmit={signInWithEmail} className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border rounded flex-1"
              required
            />
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Magic Link</button>
          </form>
          {message && <p className="text-sm mt-2">{message}</p>}
        </div>
        
        <QuickSignUp />
        
        <div className="text-sm text-muted">Already have a magic link? Click it to return and you will be signed in automatically.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">Signed in as {user.email}</div>
        <button
          className="text-sm underline"
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
          }}
        >
          Sign out
        </button>
      </div>

      {/* Create thread toggle — visible on mobile only; on desktop it's moved into the filters row below */}
      <div className="flex items-center justify-between md:hidden">
        <div />
        <div>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? 'Hide thread form' : 'Start a New Thread'}
          </button>
        </div>
      </div>

      {/* Filters: sort and date range */}
      <div className="p-3 border rounded bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Sort:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-2 py-1 border rounded"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_votes">Most votes</option>
            <option value="least_votes">Least votes</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-1 border rounded" />
          <label className="text-sm">To:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-1 border rounded" />
          <button
            className="px-2 py-1 bg-gray-200 rounded text-sm"
            onClick={() => { setStartDate(''); setEndDate(''); setSortOption('newest'); }}
          >
            Clear
          </button>
        </div>
        {/* Desktop start button placed on same row as filters */}
        <div className="hidden md:flex md:items-center md:ml-4">
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? 'Hide thread form' : 'Start a New Thread'}
          </button>
        </div>
      </div>

      {showForm && resolvedCityId && (
        <NewThreadForm
          cityId={resolvedCityId}
          citySlug={citySlug}
          onThreadCreated={() => {
            fetchThreads();
            setShowForm(false);
          }}
        />
      )}

      {threads.length === 0 ? (
        <div className="p-4 border rounded bg-white">No threads yet. Use the form above to start a discussion!</div>
      ) : (
        threads.map((t) => (
          <ThreadCard key={t.id} thread={{ ...t, author_handle: 'anon', city_slug: citySlug }} />
        ))
      )}
    </div>
  );
}
