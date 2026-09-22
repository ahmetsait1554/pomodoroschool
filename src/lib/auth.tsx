import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, defaultPreferences, type Profile, type ProfilePreferences } from './supabase';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<ProfilePreferences>) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, preferences')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, display_name: 'Student', preferences: defaultPreferences })
        .select('id, display_name, avatar_url, preferences')
        .single();

      if (!insertError && newProfile) {
        setProfile(newProfile as Profile);
      }
      return;
    }

    const merged: Profile = {
      ...data,
      preferences: { ...defaultPreferences, ...(data.preferences as ProfilePreferences) },
    };
    setProfile(merged);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
        preferences: defaultPreferences,
      });
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function updatePreferences(prefs: Partial<ProfilePreferences>) {
    if (!profile || !session) return;
    const merged = { ...profile.preferences, ...prefs };
    setProfile({ ...profile, preferences: merged });
    await supabase.from('profiles').update({ preferences: merged, updated_at: new Date().toISOString() }).eq('id', session.user.id);
  }

  async function updateDisplayName(name: string) {
    if (!profile || !session) return;
    setProfile({ ...profile, display_name: name });
    await supabase.from('profiles').update({ display_name: name, updated_at: new Date().toISOString() }).eq('id', session.user.id);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, updatePreferences, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
