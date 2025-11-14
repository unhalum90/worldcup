'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const WORLD_CUP_CITIES = [
  'Atlanta', 'Boston', 'Dallas', 'Guadalajara', 'Houston', 'Kansas City',
  'Los Angeles', 'Mexico City', 'Miami', 'Monterrey', 'New York / New Jersey',
  'Philadelphia', 'San Francisco Bay Area', 'Seattle', 'Toronto', 'Vancouver'
];

interface GeneratedArticle {
  title: string;
  outline: string;
  content: string;
}

export default function GenerateArticlePage() {
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState('');

  async function handleGenerateArticle() {
    const topic = customTopic.trim() || selectedKeyword.trim();
    
    if (!topic) {
      setError('Please enter a topic or select a keyword');
      return;
    }

    setLoading(true);
    setError('');
    setArticle(null);

    try {
      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          city: selectedCity || null,
          referenceUrl: referenceUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err: any) {
      console.error('Error generating article:', err);
      setError(err.message || 'Failed to generate article');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!article) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: saveError } = await supabase
        .from('blog_posts')
        .insert({
          title: article.title,
          content_markdown: article.content,
          city: selectedCity || null,
          status: 'draft',
          author_id: userData?.user?.id || null,
        });

      if (saveError) throw saveError;

      alert('Article saved as draft!');
      
      // Reset form
      setArticle(null);
      setCustomTopic('');
      setSelectedKeyword('');
      setReferenceUrl('');
    } catch (err: any) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft: ' + err.message);
    }
  }

  async function handleRegenerate() {
    handleGenerateArticle();
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">AI Article Generator</h1>
        <a
          href="/admin/drafts"
          className="text-sm text-blue-600 hover:underline"
          title="Switch to the drafts list and create a blank draft"
        >
          Start a blank draft →
        </a>
      </div>
      <p className="text-gray-600 mb-8">
        Generate SEO-optimized blog posts using AI for World Cup 2026 content
      </p>

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Topic / Keyword *
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., best hotels near stadium, top restaurants"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Target City (optional)
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {WORLD_CUP_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Reference URL (optional)
          </label>
          <input
            type="url"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://example.com/article-to-reference"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            AI will analyze this URL to understand style and structure (requires external API or scraping)
          </p>
        </div>

        <button
          onClick={handleGenerateArticle}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? '✨ Generating Article...' : '🤖 Generate Article'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Generated Article Preview */}
      {article && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Generated Article</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
              >
                🔄 Regenerate
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                💾 Save Draft
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              TITLE
            </label>
            <h3 className="text-2xl font-bold">{article.title}</h3>
          </div>

          {/* Outline */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              OUTLINE
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm">{article.outline}</pre>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              CONTENT (Markdown)
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{article.content}</pre>
            </div>
          </div>

          {/* Action Buttons (Repeat at bottom) */}
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              💾 Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
