import type {
  SavedItineraryPayload,
  SavedTravelPlan,
  SavedTravelPlanRecord,
  TripInput,
} from '@/types/trip';

const BASE_PATH = '/api/travel-plans';

export interface SaveTripRequest {
  tripInput?: TripInput | null;
  itinerary: SavedItineraryPayload;
  title?: string;
  notes?: string | null;
  selectedOptionIndex?: number | null;
}

export interface UpdateTripRequest {
  title?: string;
  notes?: string | null;
  selectedOptionIndex?: number | null;
  tripInput?: TripInput | null;
  itinerary?: SavedItineraryPayload | null;
}

function mapRecordToTrip(record: SavedTravelPlanRecord): SavedTravelPlan {
  return {
    id: record.id,
    userId: record.user_id,
    tripInput: record.trip_input,
    itinerary: record.itinerary,
    selectedOptionIndex:
      typeof record.selected_option_index === 'number'
        ? record.selected_option_index
        : null,
    title: record.title?.trim() || 'Saved World Cup Trip',
    notes: record.notes ?? null,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.clone().json();
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
  } catch {
    // Ignore JSON parse errors; fall back to status text.
  }
  return res.statusText || `Request failed with status ${res.status}`;
}

export async function listSavedTrips(): Promise<SavedTravelPlan[]> {
  const res = await fetch(BASE_PATH, { cache: 'no-store' });
  if (res.status === 204) return [];
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }
  const payload = (await res.json()) as { trips?: SavedTravelPlanRecord[] };
  const trips = Array.isArray(payload.trips) ? payload.trips : [];
  return trips.map(mapRecordToTrip);
}

export async function createSavedTrip(body: SaveTripRequest): Promise<SavedTravelPlan> {
  const res = await fetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  const payload = (await res.json()) as { trip: SavedTravelPlanRecord };
  return mapRecordToTrip(payload.trip);
}

export async function fetchSavedTrip(id: string): Promise<SavedTravelPlan | null> {
  const res = await fetch(`${BASE_PATH}/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }
  const payload = (await res.json()) as { trip: SavedTravelPlanRecord };
  return mapRecordToTrip(payload.trip);
}

export async function updateSavedTrip(id: string, patch: UpdateTripRequest): Promise<SavedTravelPlan> {
  const res = await fetch(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  const payload = (await res.json()) as { trip: SavedTravelPlanRecord };
  return mapRecordToTrip(payload.trip);
}

export async function deleteSavedTrip(id: string): Promise<void> {
  const res = await fetch(`${BASE_PATH}/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    throw new Error(await extractErrorMessage(res));
  }
}
