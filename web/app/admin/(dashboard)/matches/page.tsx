'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

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
  updated_at: string;
}

const CITIES = [
  'All Cities',
  'Atlanta', 'Boston', 'Dallas', 'Guadalajara', 'Houston', 'Kansas City',
  'Los Angeles', 'Mexico City', 'Miami', 'Monterrey', 'New York/New Jersey',
  'Philadelphia', 'San Francisco Bay Area', 'Seattle', 'Toronto', 'Vancouver'
];

export default function MatchesAdminPage() {
  const [matches, setMatches] = useState<MatchPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('match_pages')
        .select('*')
        .order('match_number', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredMatches = matches.filter(match => {
    // City filter
    if (filterCity !== 'All Cities' && match.city !== filterCity) return false;
    
    // Status filter
    if (filterStatus !== 'all' && match.status !== filterStatus) return false;
    
    // Search filter (team names)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!match.team1.toLowerCase().includes(search) && 
          !match.team2.toLowerCase().includes(search)) {
        return false;
      }
    }
    
    return true;
  });

  const publishedCount = matches.filter(m => m.status === 'published').length;
  const draftCount = matches.filter(m => m.status === 'draft').length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading matches</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Make sure you&apos;ve run the migration to create the match_pages table.
          </p>
        </div>
        <button
          onClick={fetchMatches}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Pages</h1>
        <p className="text-gray-600">
          Edit and publish travel guides for all 72 group stage matches
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-gray-900">{matches.length}</div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-amber-600">{draftCount}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* City filter */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Drafts Only</option>
            <option value="published">Published Only</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 mb-4">
        Showing {filteredMatches.length} of {matches.length} matches
      </div>

      {/* Match list */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMatches.map((match, index) => (
              <tr 
                key={match.id} 
                className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {match.match_number}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {match.team1} vs {match.team2}
                  </div>
                  <div className="text-sm text-gray-500">{match.stadium}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>{match.match_date}</div>
                  <div className="text-gray-500">{match.match_time} ET</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {match.city}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    match.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/matches/${match.match_number}`}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </Link>
                    {match.status === 'published' && (
                      <Link
                        href={`/matches/${match.slug}`}
                        target="_blank"
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
