'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

interface HeadToHead {
  total_matches: number;
  team1_wins: number;
  team2_wins: number;
  draws: number;
  notable_matches?: string;
}

interface Match {
  id: string;
  match_number: number;
  slug: string;
  team1: string;
  team2: string;
  match_date: string;
  match_time: string;
  stadium: string;
  city: string;
  group_name: string | null;
  status: 'draft' | 'published';
  // SEO fields
  seo_title: string | null;
  seo_description: string | null;
  // Media
  youtube_url: string | null;
  featured_image: string | null;
  // Quick Facts (AI-generated)
  head_to_head: HeadToHead | null;
  team1_wc_appearances: number | null;
  team2_wc_appearances: number | null;
  team1_fan_culture: string | null;
  team2_fan_culture: string | null;
  // Logistics
  getting_to_stadium: string | null;
  fan_festival_info: string | null;
  visa_info: Record<string, unknown> | null;
}

export default function MatchEditorPage() {
  const params = useParams();
  const router = useRouter();
  const matchNumber = params.match_number as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    status: 'draft' as 'draft' | 'published',
    seo_title: '',
    seo_description: '',
    youtube_url: '',
    featured_image: '',
    head_to_head: null as HeadToHead | null,
    team1_wc_appearances: null as number | null,
    team2_wc_appearances: null as number | null,
    team1_fan_culture: '',
    team2_fan_culture: '',
    getting_to_stadium: '',
    fan_festival_info: '',
  });

  const fetchMatch = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('match_pages')
        .select('*')
        .eq('match_number', parseInt(matchNumber))
        .single();

      if (error) throw error;
      setMatch(data);
      setFormData({
        status: data.status || 'draft',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        youtube_url: data.youtube_url || '',
        featured_image: data.featured_image || '',
        head_to_head: data.head_to_head || null,
        team1_wc_appearances: data.team1_wc_appearances,
        team2_wc_appearances: data.team2_wc_appearances,
        team1_fan_culture: data.team1_fan_culture || '',
        team2_fan_culture: data.team2_fan_culture || '',
        getting_to_stadium: data.getting_to_stadium || '',
        fan_festival_info: data.fan_festival_info || '',
      });
    } catch (error) {
      console.error('Error fetching match:', error);
      setMessage({ type: 'error', text: 'Failed to load match' });
    } finally {
      setLoading(false);
    }
  }, [matchNumber]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const handleSave = async () => {
    if (!match) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/matches/${matchNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          head_to_head: formData.head_to_head,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      setMessage({ type: 'success', text: 'Match saved successfully!' });
      fetchMatch();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateFacts = async () => {
    if (!match) return;
    setGenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/matches/generate-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1: match.team1,
          team2: match.team2,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate facts');
      }

      const facts = await response.json();
      
      setFormData(prev => ({
        ...prev,
        head_to_head: facts.head_to_head || prev.head_to_head,
        team1_wc_appearances: facts.team1_wc_appearances ?? prev.team1_wc_appearances,
        team2_wc_appearances: facts.team2_wc_appearances ?? prev.team2_wc_appearances,
        team1_fan_culture: facts.team1_fan_culture || prev.team1_fan_culture,
        team2_fan_culture: facts.team2_fan_culture || prev.team2_fan_culture,
      }));

      setMessage({ type: 'success', text: 'Facts generated! Review and save when ready.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to generate facts' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Match not found</h2>
        <Link href="/admin/matches" className="text-red-600 hover:underline mt-4 inline-block">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/matches" className="text-red-600 hover:underline text-sm">
            ← Back to matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Match #{match.match_number}: {match.team1} vs {match.team2}
          </h1>
          <p className="text-gray-500 mt-1">
            {formatDate(match.match_date)} • {match.match_time} • {match.stadium}, {match.city}
            {match.group_name && ` • Group ${match.group_name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {formData.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Quick Facts Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Facts</h2>
            <button
              onClick={handleGenerateFacts}
              disabled={generating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Generating...
                </>
              ) : (
                <>
                  ✨ AI Generate Facts
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Head to Head */}
            <div className="col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Head-to-Head Record</h3>
              {formData.head_to_head ? (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formData.head_to_head.total_matches}</p>
                    <p className="text-sm text-gray-500">Total Matches</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formData.head_to_head.team1_wins}</p>
                    <p className="text-sm text-gray-500">{match.team1} Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{formData.head_to_head.draws}</p>
                    <p className="text-sm text-gray-500">Draws</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{formData.head_to_head.team2_wins}</p>
                    <p className="text-sm text-gray-500">{match.team2} Wins</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Click &quot;AI Generate Facts&quot; to populate</p>
              )}
            </div>

            {/* World Cup Appearances */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team1} World Cup Appearances
              </label>
              <input
                type="number"
                value={formData.team1_wc_appearances ?? ''}
                onChange={(e) => setFormData({ ...formData, team1_wc_appearances: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="e.g., 17"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team2} World Cup Appearances
              </label>
              <input
                type="number"
                value={formData.team2_wc_appearances ?? ''}
                onChange={(e) => setFormData({ ...formData, team2_wc_appearances: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="e.g., 3"
              />
            </div>

            {/* Fan Culture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team1} Fan Culture
              </label>
              <textarea
                value={formData.team1_fan_culture}
                onChange={(e) => setFormData({ ...formData, team1_fan_culture: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Key things about this team's supporters..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.team2} Fan Culture
              </label>
              <textarea
                value={formData.team2_fan_culture}
                onChange={(e) => setFormData({ ...formData, team2_fan_culture: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Key things about this team's supporters..."
              />
            </div>
          </div>
        </section>

        {/* Logistics Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logistics & Planning</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Getting to {match.stadium}
              </label>
              <textarea
                value={formData.getting_to_stadium}
                onChange={(e) => setFormData({ ...formData, getting_to_stadium: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Public transit options, parking info, recommended arrival time..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fan Festival in {match.city}
              </label>
              <textarea
                value={formData.fan_festival_info}
                onChange={(e) => setFormData({ ...formData, fan_festival_info: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="FIFA Fan Festival location, hours, what to expect..."
              />
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt="Preview"
                  className="mt-2 max-h-48 rounded-lg object-cover"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </section>

        {/* SEO Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder={`${match.team1} vs ${match.team2} - World Cup 2026`}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.seo_title.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Everything you need to know about the match..."
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.seo_description.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <div className="flex items-center text-gray-500">
                <span className="text-sm">/matches/</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded ml-1">
                  {match.slug}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Status & Actions */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h2>

          <div className="flex items-center gap-4 mb-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={() => setFormData({ ...formData, status: 'draft' })}
                className="form-radio text-red-600"
              />
              <span className="ml-2">Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={() => setFormData({ ...formData, status: 'published' })}
                className="form-radio text-red-600"
              />
              <span className="ml-2">Published</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/matches/${match.slug}`}
              target="_blank"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Preview Page →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
