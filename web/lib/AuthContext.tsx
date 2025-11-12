'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { teamColors } from '@/lib/constants/teamColors';
import type { UserProfile } from '@/lib/profile/types';

const DEFAULT_THEME = { primary: '#2A398D', secondary: '#E61D25' };

function applyTheme(favoriteTeam?: string | null) {
  if (typeof window === 'undefined') return;
  const palette = (favoriteTeam && teamColors[favoriteTeam]) || DEFAULT_THEME;
  const root = document.documentElement;
  root.style.setProperty('--primary-color', palette.primary);
  root.style.setProperty('--secondary-color', palette.secondary);
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  profile: null,
});

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: UserProfile | null;
};

export function AuthProvider({ children, initialUser = null, initialProfile = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(!initialUser);

  const hydrateProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      setProfile(data ?? null);
      applyTheme(data?.favorite_team);
    } catch (err) {
      console.warn('Failed to load profile for theming', err);
      setProfile(null);
      applyTheme(undefined);
    }
  };

  // Apply theme immediately from initialProfile on mount (no network hop)
  useEffect(() => {
    if (initialProfile?.favorite_team) {
      applyTheme(initialProfile.favorite_team);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If we already have an initial user from SSR, skip the initial getSession call
    if (initialUser) {
      setLoading(false);
    } else {
      // Fallback: check active session client-side when SSR didn't provide it
      const timeout = setTimeout(() => {
        console.warn('[AuthContext] Session check timeout after 10s, forcing loading=false');
        setLoading(false);
      }, 10000);

      supabase.auth
        .getSession()
        .then(async ({ data: { session } }: { data: { session: Session | null } }) => {
          clearTimeout(timeout);
          console.log('[AuthContext] Session loaded:', !!session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await hydrateProfile(session.user.id);
          } else {
            setProfile(null);
            applyTheme(undefined);
          }
          setLoading(false);
        })
        .catch((error: unknown) => {
          clearTimeout(timeout);
          console.error('[AuthContext] getSession failed:', error);
          setLoading(false);
        });
    }

    // Always listen for auth changes to keep state in sync
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await hydrateProfile(session.user.id);
      } else {
        setProfile(null);
        applyTheme(undefined);
      }
    });

    return () => subscription.unsubscribe();
    // Only re-run if initialUser changes across navigations
  }, [initialUser]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Also tell the server to clear SSR cookies immediately
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
          credentials: 'include',
        });
      } catch (e) {
        console.warn('Session sync on signOut failed', e);
      }
    } finally {
      setUser(null);
      setProfile(null);
      applyTheme(undefined);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
