import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase';
import AuthContext from '@/src/lib/auth/AuthContext';
import { AuthModal } from '@/src/components/AuthModal';
import { getUserFromAuth } from '../user/user-queries';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signIn' | 'signUp'>(
    'signIn'
  );

  useEffect(() => {
    setLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        if (session?.user) {
          const user = await getUserFromAuth(session.user.id);
          setUser(user ?? null);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          import.meta.env.MODE === 'development'
            ? 'http://localhost:5173/welcome'
            : 'https://rubberducktarot.app/welcome',
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const showAuthModal = (mode: 'signIn' | 'signUp') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const hideAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    session,
    loading,
    signInWithMagicLink,
    signOut,
    isAuthModalOpen,
    authModalMode,
    showAuthModal,
    hideAuthModal,
    setAuthModalMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};
export default AuthProvider;
