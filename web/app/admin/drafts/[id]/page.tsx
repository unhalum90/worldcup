'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const WORLD_CUP_CITIES = [
  'Atlanta', 'Boston', 'Dallas', 'Guadalajara', 'Houston', 'Kansas City',
  'Los Angeles', 'Mexico City', 'Miami', 'Monterrey', 'New York / New Jersey',
  'Philadelphia', 'San Francisco Bay Area', 'Seattle', 'Toronto', 'Vancouver'
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  content_markdown: string;
  excerpt: string | null;
  city: string | null;
  tags: string[];
  seo_keywords: string[];
  meta_description: string | null;
  featured_image_url: string | null;
}

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to load post');
      router.push('/admin/drafts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!post) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: post.title,
          slug: post.slug,
          content_markdown: post.content_markdown,
          excerpt: post.excerpt,
          city: post.city,
          tags: post.tags,
          seo_keywords: post.seo_keywords,
          meta_description: post.meta_description,
          featured_image_url: post.featured_image_url,
        })
        .eq('id', postId);

      if (error) throw error;
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!post) return;

    if (!confirm('Are you sure you want to publish this post?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) throw error;
      
      alert('Published successfully!');
      router.push('/admin/drafts');
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  function handleAddTag() {
    if (!post || !tagInput.trim()) return;
    if (post.tags.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setPost({ ...post, tags: [...post.tags, tagInput.trim()] });
    setTagInput('');
  }

  function handleRemoveTag(tag: string) {
    if (!post) return;
    setPost({ ...post, tags: post.tags.filter(t => t !== tag) });
  }

  function handleAddKeyword() {
    if (!post || !keywordInput.trim()) return;
    if (post.seo_keywords.includes(keywordInput.trim())) {
      setKeywordInput('');
      return;
    }
    setPost({ ...post, seo_keywords: [...post.seo_keywords, keywordInput.trim()] });
    setKeywordInput('');
  }

  function handleRemoveKeyword(keyword: string) {
    if (!post) return;
    setPost({ ...post, seo_keywords: post.seo_keywords.filter(k => k !== keyword) });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Post not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/drafts')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Saving...' : '💾 Save Draft'}
          </button>
          {post.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              ✅ Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full px-4 py-2 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium mb-2">URL Slug</label>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /blog/{post.slug}
            </p>
          </div>

          {/* Content Editor */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium mb-2">Content (Markdown) *</label>
            <textarea
              value={post.content_markdown}
              onChange={(e) => setPost({ ...post, content_markdown: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={25}
              placeholder="Write your article in Markdown..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Supports Markdown: ## Headings, **bold**, *italic*, [links](url), lists, etc.
            </p>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* City */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">City</label>
            <select
              value={post.city || ''}
              onChange={(e) => setPost({ ...post, city: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">None</option>
              {WORLD_CUP_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SEO Keywords */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">SEO Keywords</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add keyword..."
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKeyword}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.seo_keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-700 rounded"
                >
                  {kw}
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Meta Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              value={post.meta_description || ''}
              onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={160}
              placeholder="SEO meta description (max 160 chars)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {post.meta_description?.length || 0}/160 characters
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={post.excerpt || ''}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief excerpt for listings..."
            />
          </div>

          {/* Featured Image */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Featured Image URL</label>
            <input
              type="url"
              value={post.featured_image_url || ''}
              onChange={(e) => setPost({ ...post, featured_image_url: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-8 -mx-8 px-8 py-4 flex justify-end gap-2">
        <button
          onClick={() => router.push('/admin/drafts')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {saving ? 'Saving...' : '💾 Save Draft'}
        </button>
        {post.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
          >
            ✅ Publish Now
          </button>
        )}
      </div>
    </div>
  );
}
