import { useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/profile/types';

type FetchOptions = RequestInit & { signal?: AbortSignal };

function parseProfileResponse(res: Response): Promise<UserProfile | null> {
  if (res.status === 204 || res.status === 404) {
    return Promise.resolve(null);
  }
  return res.json().then((data) => data?.profile ?? null);
}

export async function fetchProfile(options: FetchOptions = {}): Promise<UserProfile | null> {
  const res = await fetch('/api/profile', {
    cache: 'no-store',
    ...options,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    let message = 'Failed to load profile';
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return parseProfileResponse(res);
}

export async function saveProfile(patch: Partial<UserProfile>): Promise<UserProfile | null> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    let message = 'Failed to save profile';
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      // swallow parse errors
    }
    throw new Error(message);
  }

  return parseProfileResponse(res);
}

export function useProfile(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setProfile(null);
      setError(null);
      return;
    }
    load();
  }, [enabled, load]);

  return {
    profile,
    loading,
    error,
    refresh: load,
    setProfile,
  };
}
