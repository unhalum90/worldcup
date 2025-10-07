"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  threadId: string;
  thread: any;
  citySlug: string;
};

export default function ThreadDetailClient({ threadId, thread, citySlug }: Props) {
  const _supabase = supabase;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [threadVote, setThreadVote] = useState<number | null>(null);
  const [threadScore, setThreadScore] = useState<number>(thread.score || 0);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function init() {
  const { data } = await _supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);

      if (data.user) {
        fetchPosts();
        // fetch thread vote by this user
        const { data: tv } = await _supabase
          .from('votes')
          .select('id, value')
          .eq('user_id', data.user.id)
          .eq('target_type', 'thread')
          .eq('target_id', threadId)
          .maybeSingle();
        if (tv) setThreadVote(tv.value);
      }
    }
    init();

    const { data: sub } = _supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPosts();
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [threadId]);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await _supabase
      .from('posts')
      .select('id, body_md, author_id, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(100);
    setPosts(data || []);
    setLoading(false);
  }

  async function toggleThreadUpvote(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return alert('Sign in to vote');

    // find existing vote
    const { data: existing } = await _supabase
      .from('votes')
      .select('id, value')
      .eq('user_id', user.id)
      .eq('target_type', 'thread')
      .eq('target_id', threadId)
      .maybeSingle();

    if (!existing) {
      const { error } = await _supabase.from('votes').insert({
        user_id: user.id,
        target_type: 'thread',
        target_id: threadId,
        value: 1
      });
      if (!error) {
        setThreadVote(1);
        setThreadScore((s) => s + 1);
      }
    } else if (existing.value === 1) {
      const { error } = await _supabase.from('votes').delete().eq('id', existing.id);
      if (!error) {
        setThreadVote(null);
        setThreadScore((s) => s - 1);
      }
    } else {
      const { error } = await _supabase.from('votes').update({ value: 1 }).eq('id', existing.id);
      if (!error) {
        setThreadVote(1);
        setThreadScore((s) => s + 2);
      }
    }
  }

  async function togglePostUpvote(e: React.MouseEvent, postId: string, index: number) {
    e.preventDefault();
    if (!user) return alert('Sign in to vote');

    const { data: existing } = await _supabase
      .from('votes')
      .select('id, value')
      .eq('user_id', user.id)
      .eq('target_type', 'post')
      .eq('target_id', postId)
      .maybeSingle();

    const postsCopy = [...posts];

    if (!existing) {
      const { error } = await _supabase.from('votes').insert({
        user_id: user.id,
        target_type: 'post',
        target_id: postId,
        value: 1
      });
      if (!error) {
        // optimistic update: increment post score locally
        if (postsCopy[index]) postsCopy[index].score = (postsCopy[index].score || 0) + 1;
        setPosts(postsCopy);
      }
    } else if (existing.value === 1) {
      const { error } = await _supabase.from('votes').delete().eq('id', existing.id);
      if (!error) {
        if (postsCopy[index]) postsCopy[index].score = Math.max(0, (postsCopy[index].score || 0) - 1);
        setPosts(postsCopy);
      }
    } else {
      const { error } = await _supabase.from('votes').update({ value: 1 }).eq('id', existing.id);
      if (!error) {
        if (postsCopy[index]) postsCopy[index].score = (postsCopy[index].score || 0) + 2;
        setPosts(postsCopy);
      }
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const { error } = await _supabase
        .from('posts')
        .insert({
          thread_id: threadId,
          author_id: user.id,
          body_md: replyBody.trim()
        });

      if (error) {
        setMessage('Error posting reply: ' + error.message);
      } else {
        setReplyBody('');
        setMessage('Reply posted!');
        fetchPosts();
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }

    setSubmitting(false);
  }

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="p-4 border rounded bg-white">
        <p>You must be signed in to view this thread.</p>
        <a href={`/forums/${citySlug}`} className="text-blue-600 hover:underline">← Go back to sign in</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Thread Body */}
      <div className="p-6 border rounded bg-white">
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{thread.body_md}</p>
        </div>
        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <div>Posted by author • {new Date(thread.created_at).toLocaleString()}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleThreadUpvote}
              className={`p-1 rounded ${threadVote === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              ▲
            </button>
            <div className="font-bold">{threadScore}</div>
          </div>
        </div>
      </div>

      {/* Posts/Replies */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h3>
          {posts.map((post, idx) => (
            <div key={post.id} className="p-4 border rounded bg-gray-50 flex flex-col gap-3">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{post.body_md}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">By user • {new Date(post.created_at).toLocaleString()}</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => togglePostUpvote(e, post.id, idx)}
                    className="p-1 rounded bg-gray-100"
                  >
                    ▲
                  </button>
                  <div className="font-medium">{post.score || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      <div className="p-4 border rounded bg-white">
        <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
        <form onSubmit={submitReply} className="space-y-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full px-3 py-2 border rounded h-24"
            maxLength={2000}
            required
          />
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting || !replyBody.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Reply'}
            </button>
            <span className="text-sm text-gray-500">
              Signed in as {user.email}
            </span>
          </div>
        </form>
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}