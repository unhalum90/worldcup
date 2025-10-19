'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Keyword {
  id: string;
  keyword: string;
  city?: string | null;
  search_volume?: number;
  competition?: string;
  created_at: string;
}

const WORLD_CUP_CITIES = [
  'Atlanta', 'Boston', 'Dallas', 'Guadalajara', 'Houston', 'Kansas City',
  'Los Angeles', 'Mexico City', 'Miami', 'Monterrey', 'New York / New Jersey',
  'Philadelphia', 'San Francisco Bay Area', 'Seattle', 'Toronto', 'Vancouver'
];

export default function KeywordResearchPage() {
  const [seedTopic, setSeedTopic] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<Keyword[]>([]);
  const [error, setError] = useState('');

  async function handleGenerateKeywords() {
    if (!seedTopic.trim()) {
      setError('Please enter a seed topic');
      return;
    }

    setLoading(true);
    setError('');
    setKeywords([]);

    try {
      const response = await fetch('/api/admin/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedTopic: seedTopic.trim(),
          city: selectedCity || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate keywords');
      }

      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (err: any) {
      console.error('Error generating keywords:', err);
      setError(err.message || 'Failed to generate keywords');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveKeyword(keyword: string) {
    try {
      const { data, error: saveError } = await supabase
        .from('keywords')
        .insert({
          keyword,
          city: selectedCity || null,
          source: 'openai',
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (data) {
        setSavedKeywords([data, ...savedKeywords]);
        alert(`Saved: ${keyword}`);
      }
    } catch (err: any) {
      console.error('Error saving keyword:', err);
      alert('Failed to save keyword: ' + err.message);
    }
  }

  async function handleSaveAll() {
    try {
      const keywordsToSave = keywords.map(kw => ({
        keyword: kw,
        city: selectedCity || null,
        source: 'openai',
      }));

      const { data, error: saveError } = await supabase
        .from('keywords')
        .insert(keywordsToSave)
        .select();

      if (saveError) throw saveError;

      if (data) {
        setSavedKeywords([...data, ...savedKeywords]);
        alert(`Saved ${data.length} keywords!`);
        setKeywords([]);
      }
    } catch (err: any) {
      console.error('Error saving keywords:', err);
      alert('Failed to save keywords: ' + err.message);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Keyword Research Tool</h1>
      <p className="text-gray-600 mb-8">
        Generate SEO keyword ideas using AI based on your topic and target city
      </p>

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Seed Topic / Theme *
            </label>
            <input
              type="text"
              value={seedTopic}
              onChange={(e) => setSeedTopic(e.target.value)}
              placeholder="e.g., best restaurants, top attractions, hotel deals"
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

        <button
          onClick={handleGenerateKeywords}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Generating...' : '🔍 Generate Keywords'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Generated Keywords */}
      {keywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Generated Keywords ({keywords.length})
            </h2>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              💾 Save All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keywords.map((kw, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="font-medium">{kw}</span>
                <button
                  onClick={() => handleSaveKeyword(kw)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Keywords */}
      {savedKeywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recently Saved ({savedKeywords.length})
          </h2>
          <div className="space-y-2">
            {savedKeywords.map((kw) => (
              <div
                key={kw.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div>
                  <span className="font-medium">{kw.keyword}</span>
                  {kw.city && (
                    <span className="ml-2 text-sm text-gray-600">
                      • {kw.city}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(kw.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
