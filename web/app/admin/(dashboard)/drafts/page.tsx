'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  status: string;
  city: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [published, setPublished] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      // Fetch drafts
      const { data: draftData } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, tags, created_at, updated_at')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      // Fetch published
      const { data: publishedData } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, tags, created_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      setDrafts(draftData || []);
      setPublished(publishedData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh lists
      setDrafts(drafts.filter(d => d.id !== id));
      setPublished(published.filter(p => p.id !== id));
      alert('Post deleted');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert('Failed to delete: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  const displayPosts = activeTab === 'drafts' ? drafts : published;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <Link
          href="/admin/generate"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + New Article
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'drafts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Drafts ({drafts.length})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'published'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Published ({published.length})
        </button>
      </div>

      {/* Posts List */}
      {displayPosts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">
            {activeTab === 'drafts' 
              ? 'No drafts yet. Generate your first article!' 
              : 'No published posts yet.'}
          </p>
          <Link
            href="/admin/generate"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayPosts.map((post) => (
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
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-gray-500">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/drafts/${post.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
