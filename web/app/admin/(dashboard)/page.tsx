'use client';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    totalKeywords: 0,
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // Get post counts
      const { data: allPosts, error: postsErr } = await supabase
        .from('blog_posts')
        .select('id, status');
      if (postsErr) console.warn('blog_posts select error:', postsErr.message);

      const list = Array.isArray(allPosts) ? allPosts : [];
      const totalPosts = list.length;
      const draftPosts = list.filter((p: any) => p.status === 'draft').length;
      const publishedPosts = list.filter((p: any) => p.status === 'published').length;

      // Get keyword count
      const { count: keywordCount, error: kwErr } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true });
      if (kwErr) console.warn('keywords count error:', kwErr.message);

      // Get recent posts
      const { data: recentPosts, error: recentErr } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (recentErr) console.warn('recent posts error:', recentErr.message);

      setStats({
        totalPosts,
        draftPosts,
        publishedPosts,
        totalKeywords: keywordCount || 0,
        recentPosts: recentPosts || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon="📝"
          color="blue"
        />
        <StatCard
          title="Draft Posts"
          value={stats.draftPosts}
          icon="✏️"
          color="yellow"
        />
        <StatCard
          title="Published Posts"
          value={stats.publishedPosts}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Keywords"
          value={stats.totalKeywords}
          icon="🔍"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/keywords"
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-lg mb-1">Research Keywords</h3>
            <p className="text-gray-600 text-sm">
              Generate SEO keywords for your target cities
            </p>
          </Link>

          <Link
            href="/admin/generate"
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-lg mb-1">Generate Article</h3>
            <p className="text-gray-600 text-sm">
              Use AI to create new blog content
            </p>
          </Link>

          <Link
            href="/admin/drafts"
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-lg mb-1">View Drafts</h3>
            <p className="text-gray-600 text-sm">
              Edit and publish draft articles
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
        {stats.recentPosts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No posts yet. Create your first article!</p>
            <Link
              href="/admin/generate"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Article
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/drafts/${post.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.city || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
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
  };

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
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        colorClasses[status as keyof typeof colorClasses] || colorClasses.draft
      }`}
    >
      {status}
    </span>
  );
}
