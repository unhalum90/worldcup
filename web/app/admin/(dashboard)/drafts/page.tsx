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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setError(null);
      console.log('[DraftsPage] Fetching posts...');
      
      // Fetch drafts
      const { data: draftData, error: draftError } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, tags, created_at, updated_at')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      console.log('[DraftsPage] Drafts query result:', { 
        count: draftData?.length, 
        error: draftError?.message 
      });

      if (draftError) {
        console.error('[DraftsPage] Error fetching drafts:', draftError);
        setError(draftError.message);
        return;
      }

      // Fetch published
      const { data: publishedData, error: publishedError } = await supabase
        .from('blog_posts')
        .select('id, title, status, city, tags, created_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      console.log('[DraftsPage] Published query result:', { 
        count: publishedData?.length, 
        error: publishedError?.message 
      });

      if (publishedError) {
        console.warn('[DraftsPage] Error fetching published posts:', publishedError);
        // Don't fail completely if only published fetch fails
      }

      setDrafts(draftData || []);
      setPublished(publishedData || []);
      
      console.log('[DraftsPage] Posts loaded successfully');
    } catch (err) {
      console.error('Unexpected error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading posts</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchPosts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const displayPosts = activeTab === 'drafts' ? drafts : published;

  async function handleNewBlankDraft() {
    try {
      const now = new Date();
      const baseSlug = `untitled-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${now.getHours()}${now.getMinutes()}`;
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: 'Untitled draft',
          slug: baseSlug,
          status: 'draft',
          content_markdown: '',
          excerpt: null,
          city: null,
          tags: [],
          seo_keywords: [],
          meta_description: null,
          featured_image_url: null,
          author_id: null,
        })
        .select('id')
        .single();
      if (error) throw error;
      window.location.href = `/admin/drafts/${data.id}`;
    } catch (e: any) {
      alert(`Failed to create draft: ${e?.message || e}`);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8 gap-3">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewBlankDraft}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Blank Draft
          </button>
          <Link
            href="/admin/generate"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + AI Article
          </Link>
        </div>
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
