'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  city: string | null;
  tags: string[];
  published_at: string;
  featured_image_url: string | null;
}

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  async function fetchPublishedPosts() {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, city, tags, published_at, featured_image_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching published posts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Published Articles</h1>

      {posts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No published posts yet.</p>
          <Link
            href="/admin/drafts"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Drafts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  {post.city && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {post.city}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:underline text-sm"
                      target="_blank"
                    >
                      View →
                    </Link>
                    <Link
                      href={`/admin/drafts/${post.id}`}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
