// src/context/AuthContext.tsx - Supabase 認証状態コンテキスト
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from '../lib/supabaseClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error('Supabase セッション取得に失敗しました', error);
        }
        setSession(data.session ?? null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const redirectTo = window.location.origin;
      await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
    } catch (error) {
      console.error('Google サインイン開始に失敗しました', error);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('サインアウトに失敗しました', error);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signInWithGoogle: handleGoogleSignIn,
      signOut: handleSignOut,
    }),
    [session, loading, handleGoogleSignIn, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth は AuthProvider の内部で使用してください');
  }
  return context;
};
