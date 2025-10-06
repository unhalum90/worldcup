import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

export default async function ForumsIndex() {
  // Fetch list of cities for forums
  const { data: cities } = await supabase.from('cities').select('id,name,slug').order('name');

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Host City Forums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities?.map((c: any) => (
          <Link key={c.id} href={`/forums/${c.slug}`} className="p-6 rounded-lg border bg-white hover:shadow-md">
            <h3 className="text-xl font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Visit {c.name} forum</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
