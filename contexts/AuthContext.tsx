'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { loadTasks } from '@/lib/storage';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data }: { data: { session: { user: User } | null } }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: { user: User } | null) => {
      const newUser = session?.user ?? null;
      setUser(prev => {
        // On first login, migrate localStorage tasks
        if (!prev && newUser) migrateLocalData(newUser.id);
        return newUser;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  async function migrateLocalData(userId: string) {
    const tasks = loadTasks();
    if (tasks.length === 0) return;
    await Promise.all(tasks.map(t =>
      supabase.from('tasks').upsert({
        id: t.id,
        user_id: userId,
        title: t.title,
        estimated_pomodoros: t.estimatedPomodoros,
        completed_pomodoros: t.completedPomodoros,
        is_done: t.isDone,
        created_at: new Date(t.createdAt).toISOString(),
      })
    ));
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) { alert('Supabase 설정이 필요합니다. .env.local을 확인하세요.'); return; }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
