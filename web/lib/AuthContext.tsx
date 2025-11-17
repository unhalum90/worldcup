'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
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
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function hydrateProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setProfile(data ?? null);
      applyTheme(data?.favorite_team);
    } catch {
      setProfile(null);
      applyTheme(undefined);
    }
  }

  // Load session once on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.warn('[AuthContext] getSession error:', error);
        setLoading(false);
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await hydrateProfile(data.session.user.id);
      } else {
        applyTheme(undefined);
      }

      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);

      if (session?.user) {
        await hydrateProfile(session.user.id);
      } else {
        setProfile(null);
        applyTheme(undefined);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    applyTheme(undefined);
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
