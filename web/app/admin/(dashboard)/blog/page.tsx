"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface DashboardStats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  totalKeywords: number;
  recentPosts: Array<{
    id: string;
    title: string;
    status: string;
    city: string | null;
    created_at: string;
  }>;
}

export default function BlogDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    totalKeywords: 0,
    recentPosts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setError(null);
      console.log('[BlogDashboard] Fetching dashboard stats...');
      
      const { data: allPosts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, status');

      console.log('[BlogDashboard] Posts query result:', { 
        count: allPosts?.length, 
        error: postsError?.message 
      });

      if (postsError) {
        console.error('[BlogDashboard] Error fetching posts:', postsError);
        setError(postsError.message);
        return;
      }

      const list = Array.isArray(allPosts) ? allPosts : [];
      const totalPosts = list.length;
      const draftPosts = list.filter((p: any) => p.status === 'draft').length;
      const publishedPosts = list.filter((p: any) => p.status === 'published').length;

      console.log('[BlogDashboard] Post counts:', { totalPosts, draftPosts, publishedPosts });

      const { count: keywordCount, error: keywordsError } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true });

      if (keywordsError) {
        console.warn('[BlogDashboard] Error fetching keywords:', keywordsError);
      }

      const { data: recentPosts, error: recentError } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.warn('[BlogDashboard] Error fetching recent posts:', recentError);
      }

      setStats({
        totalPosts,
        draftPosts,
        publishedPosts,
        totalKeywords: keywordCount || 0,
        recentPosts: recentPosts || [],
      });
      
      console.log('[BlogDashboard] Dashboard stats loaded successfully');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading dashboard</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardStats();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Posts" value={stats.totalPosts} icon="📝" color="blue" />
        <StatCard title="Draft Posts" value={stats.draftPosts} icon="✏️" color="yellow" />
        <StatCard title="Published Posts" value={stats.publishedPosts} icon="✅" color="green" />
        <StatCard title="Keywords" value={stats.totalKeywords} icon="🔍" color="purple" />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/keywords" className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-lg mb-1">Research Keywords</h3>
            <p className="text-gray-600 text-sm">Generate SEO keywords for your target cities</p>
          </Link>

          <Link href="/admin/generate" className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-lg mb-1">Generate Article</h3>
            <p className="text-gray-600 text-sm">Use AI to create new blog content</p>
          </Link>

          <Link href="/admin/drafts" className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-lg mb-1">View Drafts</h3>
            <p className="text-gray-600 text-sm">Edit and publish draft articles</p>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
        {stats.recentPosts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No posts yet. Create your first article!</p>
            <Link href="/admin/generate" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate Article</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/drafts/${post.id}`} className="text-blue-600 hover:underline font-medium">{post.title}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.city || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={post.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
  } as const;

  return (
    <div className={`p-6 border-2 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClasses = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  } as const;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[status as keyof typeof colorClasses] || colorClasses.draft}`}>
      {status}
    </span>
  );
}

