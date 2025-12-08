'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface RedditQuote {
  quote: string;
  username: string;
  subreddit: string;
}

interface MatchPage {
  id: string;
  match_number: number;
  slug: string;
  team1: string;
  team2: string;
  match_date: string;
  match_time: string;
  city: string;
  stadium: string;
  status: 'draft' | 'published';
  youtube_url: string | null;
  team1_storyline: string | null;
  team2_storyline: string | null;
  rivalry_context: string | null;
  fan_experience: string | null;
  infographic_url: string | null;
  map_embed_url: string | null;
  reddit_quotes: RedditQuote[];
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export default function MatchEditorPage() {
  const params = useParams();
  const router = useRouter();
  const matchNumber = parseInt(params.match_number as string);

  const [match, setMatch] = useState<MatchPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reddit quote editing
  const [newQuote, setNewQuote] = useState<RedditQuote>({ quote: '', username: '', subreddit: '' });

  useEffect(() => {
    if (matchNumber) {
      fetchMatch();
    }
  }, [matchNumber]);

  async function fetchMatch() {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('match_pages')
        .select('*')
        .eq('match_number', matchNumber)
        .single();

      if (error) throw error;
      
      // Ensure reddit_quotes is an array
      setMatch({
        ...data,
        reddit_quotes: data.reddit_quotes || []
      });
      if (data.updated_at) {
        setLastSaved(new Date(data.updated_at));
      }
    } catch (err: any) {
      console.error('Error fetching match:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = useCallback(async (silent = false) => {
    if (!match) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('match_pages')
        .update({
          youtube_url: match.youtube_url,
          team1_storyline: match.team1_storyline,
          team2_storyline: match.team2_storyline,
          rivalry_context: match.rivalry_context,
          fan_experience: match.fan_experience,
          infographic_url: match.infographic_url,
          map_embed_url: match.map_embed_url,
          reddit_quotes: match.reddit_quotes,
          seo_title: match.seo_title,
          seo_description: match.seo_description,
        })
        .eq('id', match.id);

      if (error) throw error;

      setLastSaved(new Date());
      if (!silent) alert('Saved successfully!');
    } catch (err: any) {
      console.error('Error saving match:', err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [match]);

  async function handlePublish() {
    if (!match) return;

    if (!confirm('Are you sure you want to publish this match page?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('match_pages')
        .update({
          youtube_url: match.youtube_url,
          team1_storyline: match.team1_storyline,
          team2_storyline: match.team2_storyline,
          rivalry_context: match.rivalry_context,
          fan_experience: match.fan_experience,
          infographic_url: match.infographic_url,
          map_embed_url: match.map_embed_url,
          reddit_quotes: match.reddit_quotes,
          seo_title: match.seo_title,
          seo_description: match.seo_description,
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', match.id);

      if (error) throw error;

      setMatch({ ...match, status: 'published' });
      alert('Published successfully!');
    } catch (err: any) {
      console.error('Error publishing match:', err);
      alert('Failed to publish: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!match) return;

    if (!confirm('Are you sure you want to unpublish this match page?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('match_pages')
        .update({
          status: 'draft',
          published_at: null,
        })
        .eq('id', match.id);

      if (error) throw error;

      setMatch({ ...match, status: 'draft' });
      alert('Unpublished successfully!');
    } catch (err: any) {
      console.error('Error unpublishing match:', err);
      alert('Failed to unpublish: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !match) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `match-${match.match_number}-infographic-${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('match-infographics')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('match-infographics')
        .getPublicUrl(fileName);

      setMatch({ ...match, infographic_url: urlData.publicUrl });
      alert('Image uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  function addRedditQuote() {
    if (!match || !newQuote.quote.trim()) return;

    setMatch({
      ...match,
      reddit_quotes: [...match.reddit_quotes, { ...newQuote }]
    });
    setNewQuote({ quote: '', username: '', subreddit: '' });
  }

  function removeRedditQuote(index: number) {
    if (!match) return;

    setMatch({
      ...match,
      reddit_quotes: match.reddit_quotes.filter((_, i) => i !== index)
    });
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!match || saving) return;

    const interval = setInterval(() => {
      handleSave(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [match, saving, handleSave]);

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading match</h3>
          <p className="text-red-600 text-sm">{error || 'Match not found'}</p>
        </div>
        <Link
          href="/admin/matches"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/admin/matches"
            className="text-blue-600 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Match {match.match_number}: {match.team1} vs {match.team2}
          </h1>
          <p className="text-gray-600">
            {match.match_date} at {match.match_time} ET • {match.stadium}, {match.city}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            match.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {match.status}
          </span>
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        {match.status === 'draft' ? (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Publish
          </button>
        ) : (
          <>
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              Unpublish
            </button>
            <Link
              href={`/matches/${match.slug}`}
              target="_blank"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View Live →
            </Link>
          </>
        )}
      </div>

      <div className="space-y-8">
        {/* SEO Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={match.seo_title || ''}
                onChange={(e) => setMatch({ ...match, seo_title: e.target.value })}
                placeholder="Match 1: Mexico vs South Africa - Mexico City Travel Guide"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                value={match.seo_description || ''}
                onChange={(e) => setMatch({ ...match, seo_description: e.target.value })}
                placeholder="Everything you need to know about..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(match.seo_description || '').length}/160 characters
              </p>
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={match.youtube_url || ''}
                onChange={(e) => setMatch({ ...match, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={match.map_embed_url || ''}
                onChange={(e) => setMatch({ ...match, map_embed_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Infographic Image
              </label>
              {match.infographic_url && (
                <div className="mb-2">
                  <img 
                    src={match.infographic_url} 
                    alt="Infographic" 
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
              <p className="text-xs text-gray-500 mt-1">Or paste URL directly:</p>
              <input
                type="url"
                value={match.infographic_url || ''}
                onChange={(e) => setMatch({ ...match, infographic_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team1} Storyline
              </label>
              <textarea
                value={match.team1_storyline || ''}
                onChange={(e) => setMatch({ ...match, team1_storyline: e.target.value })}
                placeholder={`Write about ${match.team1}'s journey, key players, form, etc.`}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Supports Markdown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team2} Storyline
              </label>
              <textarea
                value={match.team2_storyline || ''}
                onChange={(e) => setMatch({ ...match, team2_storyline: e.target.value })}
                placeholder={`Write about ${match.team2}'s journey, key players, form, etc.`}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Supports Markdown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rivalry / Historical Context
              </label>
              <textarea
                value={match.rivalry_context || ''}
                onChange={(e) => setMatch({ ...match, rivalry_context: e.target.value })}
                placeholder="Historical matchups, rivalry significance, previous World Cup meetings..."
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Supports Markdown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fan Experience Notes
              </label>
              <textarea
                value={match.fan_experience || ''}
                onChange={(e) => setMatch({ ...match, fan_experience: e.target.value })}
                placeholder="What to expect at the stadium, fan zones, atmosphere, tips for traveling supporters..."
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Supports Markdown</p>
            </div>
          </div>
        </section>

        {/* Reddit Quotes Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reddit Quotes</h2>
          
          {/* Existing quotes */}
          {match.reddit_quotes.length > 0 && (
            <div className="space-y-3 mb-6">
              {match.reddit_quotes.map((quote, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeRedditQuote(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                  <p className="text-gray-800 italic">&quot;{quote.quote}&quot;</p>
                  <p className="text-sm text-gray-500 mt-2">
                    — u/{quote.username} on r/{quote.subreddit}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add new quote */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Quote</h3>
            <div className="space-y-3">
              <textarea
                value={newQuote.quote}
                onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })}
                placeholder="The quote text..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newQuote.username}
                  onChange={(e) => setNewQuote({ ...newQuote, username: e.target.value })}
                  placeholder="Reddit username"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newQuote.subreddit}
                  onChange={(e) => setNewQuote({ ...newQuote, subreddit: e.target.value })}
                  placeholder="Subreddit (e.g., soccer)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addRedditQuote}
                  disabled={!newQuote.quote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Quote
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
