import { supabase } from '@/lib/supabaseClient';
import ThreadCard from '@/components/ThreadCard';

type Props = {
  params: { city: string };
};

export default async function CityForum({ params }: Props) {
  const citySlug = params.city;

  // Fetch city and threads
  const { data: city } = await supabase.from('cities').select('*').eq('slug', citySlug).single();

  const { data: threads } = await supabase
    .from('threads')
    .select(`id, title, author_id, score, created_at`)
    .eq('city_id', city?.id)
    .order('created_at', { ascending: false })
    .limit(25);

  const list = (threads || []).map((t: any) => ({
    ...t,
    author_handle: 'anon',
    _ago: new Date(t.created_at).toLocaleString(),
    city_slug: citySlug,
  }));

  return (
    <div className="container py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{city?.name || citySlug} Forum</h1>
        <p className="text-[color:var(--color-neutral-700)] mt-2">Community discussions for {city?.name || citySlug}</p>
      </div>

      <div className="space-y-4">
        {list.map((thread: any) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
