import ThreadDetailClient from '@/components/forums/ThreadDetailClient';

type Props = {
  params: { city: string; thread: string };
};

export default async function ThreadDetail({ params }: Props) {
  const { city: citySlug, thread: threadId } = await params;

  // Server-side fetch for thread metadata only (safe)
  const encodedId = encodeURIComponent(String(threadId));
  // Use a server-only service role key when available so the server can read threads
  // even if row-level security limits anon/select access. This value must NOT be
  // exposed to the browser; it's only used during server rendering.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/threads?id=eq.${encodedId}&select=*&limit=1`, {
    headers: {
      apikey: serviceKey || anonKey,
      Authorization: `Bearer ${serviceKey || anonKey}`,
    },
    cache: 'no-store',
  });
  const threads = await res.json();
  const thread = Array.isArray(threads) && threads.length ? threads[0] : null;

  if (!thread) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Thread Not Found</h1>
          <a href={`/forums/${citySlug}`} className="text-blue-600 hover:underline">← Back to {citySlug} forum</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-6">
        <a href={`/forums/${citySlug}`} className="text-blue-600 hover:underline text-sm">← Back to {citySlug} forum</a>
        <h1 className="text-3xl font-bold mt-2">{thread.title}</h1>
        <div className="text-sm text-gray-600 mt-1">
          Topic: {thread.topic} • Created {new Date(thread.created_at).toLocaleDateString()}
        </div>
      </div>

      <ThreadDetailClient threadId={threadId} thread={thread} citySlug={citySlug} />
    </div>
  );
}