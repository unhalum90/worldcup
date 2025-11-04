"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { createMatchKey, sortMatchKeys } from '@/lib/matchSelection';

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
  selectedMatchKeys: string[];
  onChangeMatchKeys: (keys: string[]) => void;
}

export default function MatchPicker({ selectedCities, startDate, endDate, selectedMatchKeys, onChangeMatchKeys }: MatchPickerProps) {
  const t = useTranslations('planner.tripBuilder.matchPicker');
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
        setError(t('errors.load'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCities.join(','), startDate, endDate, t]);

  const toggleMatch = (city: string, date: string) => {
    const key = createMatchKey(city, date);
    if (!key) return;
    const set = new Set(selectedMatchKeys);
    if (set.has(key)) {
      set.delete(key);
    } else {
      set.add(key);
    }
    onChangeMatchKeys(sortMatchKeys(Array.from(set)));
  };

  if (!selectedCities || selectedCities.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{t('title')}</p>
        {loading && <span className="text-xs text-gray-500">{t('loading')}</span>}
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      {Object.keys(data).length === 0 && !loading ? (
        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
          {startDate && endDate
            ? t('emptyWithDates', { start: startDate, end: endDate })
            : t('empty')}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(data).map(([city, matches]) => (
            <div key={city} className="border rounded-md">
              <div className="px-3 py-2 bg-gray-50 border-b text-sm font-semibold text-gray-800">{city}</div>
              <ul className="divide-y">
                {matches.map((m) => {
                  const dateLabel = m.date;
                  const key = createMatchKey(city, m.date);
                  const isSelected = key ? selectedMatchKeys.includes(key) : false;
                  return (
                    <li key={m.id} className={`flex items-center justify-between px-3 py-2 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {m.stage ? `${m.stage}` : t('matchLabel')} {m.number ? `#${m.number}` : ''} {m.group ? `• ${m.group}` : ''}
                        </div>
                        <div className="text-xs text-gray-600">{m.stadium ? `${m.stadium} • ` : ''}{m.date}{m.time ? ` ${m.time}` : ''}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMatch(city, dateLabel)}
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {isSelected ? t('selected') : t('add')}
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
