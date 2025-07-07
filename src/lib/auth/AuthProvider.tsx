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
          try {
            const user = await getUserFromAuth(session.user.id);
            setUser(user ?? null);
          } catch (error) {
            console.error('Failed to load user data:', error);
            // Still set user to null but don't prevent the app from loading
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpForWaitlist = async (
    email: string,
    captchaToken?: string | null
  ) => {
    // Create new user and send magic link
    const waitlistEnabled = import.meta.env.VITE_WAITLIST_ENABLED === 'true';
    const options: {
      captchaToken?: string;
      emailRedirectTo?: string;
    } = {
      captchaToken: captchaToken || undefined,
    };
    if (waitlistEnabled) {
      options.emailRedirectTo = import.meta.env.VITE_EMAIL_REDIRECT_URL;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options,
    });
    return { error };
  };

  const signInWithMagicLink = async (
    email: string,
    captchaToken?: string | null
  ) => {
    // Only send magic link to existing users
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        captchaToken: captchaToken || undefined,
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
    signUpForWaitlist,
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
