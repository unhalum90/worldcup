'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle<UserProfile>();
      if (error) throw error;
      setProfile(data ?? null);
      applyTheme(data?.favorite_team);
    } catch (err) {
      console.warn('Failed to load profile for theming', err);
      setProfile(null);
      applyTheme(undefined);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await hydrateProfile(session.user.id);
      } else {
        setProfile(null);
        applyTheme(undefined);
      }
      setLoading(false);
    });

    // Listen for auth changes
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
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    applyTheme(undefined);
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
