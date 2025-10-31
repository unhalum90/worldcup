'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSavedTrip, listSavedTrips, updateSavedTrip } from '@/lib/travel-plans/api';
import type { SavedTravelPlan } from '@/types/trip';

export default function SavedTripsCard() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listSavedTrips();
        if (!ignore) {
          setTrips(data);
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to load saved trips.';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const hasTrips = trips.length > 0;

  const handleView = (trip: SavedTravelPlan) => {
    const options = Array.isArray((trip.itinerary as any)?.options)
      ? (trip.itinerary as any).options
      : [];
    if (!options.length) {
      alert('This saved itinerary is missing option details. Try generating a new trip.');
      return;
    }
    router.push(`/planner/trip-builder?saved=${trip.id}`);
  };

  const startRename = (trip: SavedTravelPlan) => {
    setEditingId(trip.id);
    setEditTitle(trip.title);
    setError(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const submitRename = async () => {
    if (!editingId) return;
    const trimmed = editTitle.trim();
    setPendingId(editingId);
    try {
      const updated = await updateSavedTrip(editingId, {
        title: trimmed || 'Saved World Cup Trip',
      });
      setTrips((current) => current.map((t) => (t.id === updated.id ? updated : t)));
      cancelRename();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to rename trip.';
      setError(message);
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (trip: SavedTravelPlan) => {
    if (!window.confirm('Delete this saved itinerary? This cannot be undone.')) {
      return;
    }
    setPendingId(trip.id);
    try {
      await deleteSavedTrip(trip.id);
      setTrips((current) => current.filter((t) => t.id !== trip.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete saved itinerary.';
      setError(message);
    } finally {
      setPendingId(null);
    }
  };

  const sortedTrips = useMemo(
    () => [...trips].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [trips]
  );

  return (
    <div className="rounded-lg border bg-white/5 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Saved Itineraries</h2>
          <p className="text-sm text-gray-600">
            Revisit your favorite plans, rename them, or reopen them in the Trip Builder.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-4 space-y-3">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {!loading && !hasTrips && (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
          You haven’t saved any itineraries yet. Generate a trip and tap “Save itinerary” to keep it here.
        </div>
      )}

      {!loading && hasTrips && (
        <ul className="mt-4 space-y-4">
          {sortedTrips.map((trip) => {
            const cities = Array.isArray(trip.tripInput?.citiesVisiting)
              ? trip.tripInput!.citiesVisiting.filter(Boolean)
              : [];
            const dateText = new Date(trip.updatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const optionIndex =
              typeof trip.selectedOptionIndex === 'number' ? trip.selectedOptionIndex : 0;
            const options = Array.isArray((trip.itinerary as any)?.options)
              ? (trip.itinerary as any).options
              : [];
            const highlightedOption = options[optionIndex] || options[0];

            return (
              <li
                key={trip.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    {editingId === trip.id ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void submitRename();
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          maxLength={120}
                          aria-label="Saved trip title"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => void submitRename()}
                            disabled={pendingId === trip.id}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                          >
                            {pendingId === trip.id ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={cancelRename}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                        <p className="text-sm text-gray-500">Updated {dateText}</p>
                        {cities.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {cities.join(' → ')}
                            {cities.length === 1 ? ' trip' : ' route'}
                          </p>
                        )}
                        {highlightedOption?.summary && (
                          <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                            {highlightedOption.summary}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => handleView(trip)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      View in Trip Builder
                    </button>
                    {editingId === trip.id ? null : (
                      <button
                        onClick={() => startRename(trip)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Rename
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(trip)}
                      disabled={pendingId === trip.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingId === trip.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="h-8 w-24 rounded bg-gray-200" />
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
