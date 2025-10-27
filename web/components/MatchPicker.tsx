"use client";

import React from 'react';

type MatchEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM:SS
  number?: number;
  stage?: string;
  group?: string;
  stadium?: string;
};

interface MatchPickerProps {
  selectedCities: string[];
  startDate?: string;
  endDate?: string;
  selectedDates: string[];
  onChangeDates: (dates: string[]) => void;
}

export default function MatchPicker({ selectedCities, startDate, endDate, selectedDates, onChangeDates }: MatchPickerProps) {
  const [data, setData] = React.useState<Record<string, MatchEntry[]>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setError(null);
      if (!selectedCities || selectedCities.length === 0) {
        setData({});
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('cities', selectedCities.join(','));
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        const res = await fetch(`/api/matches?${params.toString()}`);
        const json = await res.json();
        setData(json.grouped || {});
      } catch (e) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCities.join(','), startDate, endDate]);

  const toggleDate = (date: string) => {
    const set = new Set(selectedDates);
    if (set.has(date)) set.delete(date); else set.add(date);
    onChangeDates(Array.from(set).sort());
  };

  if (!selectedCities || selectedCities.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Select your exact matches (click to add dates)</p>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      {Object.keys(data).length === 0 && !loading ? (
        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
          No matches found for the selected cities{startDate && endDate ? ` between ${startDate} and ${endDate}` : ''}. If you already know your dates, you can enter them above.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(data).map(([city, matches]) => (
            <div key={city} className="border rounded-md">
              <div className="px-3 py-2 bg-gray-50 border-b text-sm font-semibold text-gray-800">{city}</div>
              <ul className="divide-y">
                {matches.map((m) => {
                  const dateLabel = m.date;
                  const isSelected = selectedDates.includes(dateLabel);
                  return (
                    <li key={m.id} className={`flex items-center justify-between px-3 py-2 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.stage ? `${m.stage}` : 'Match'} {m.number ? `#${m.number}` : ''} {m.group ? `• ${m.group}` : ''}</div>
                        <div className="text-xs text-gray-600">{m.stadium ? `${m.stadium} • ` : ''}{m.date}{m.time ? ` ${m.time}` : ''}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDate(dateLabel)}
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {isSelected ? 'Selected' : 'Add date'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
