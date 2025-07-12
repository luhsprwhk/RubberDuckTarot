import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../../interfaces';
import { supabase } from '../supabase/supabase';
import AuthContext from '@/src/lib/auth/AuthContext';
import { Resend } from 'resend';
import { AuthModal } from '@/src/components/AuthModal';
import { getUserFromAuth } from '../user/user-queries';

interface AuthProviderProps {
  children: React.ReactNode;
}

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signIn' | 'signUp'>(
    'signIn'
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        if (session?.user) {
          try {
            const user = await getUserFromAuth(session.user.id);
            setUser(user ?? null);
          } catch (error) {
            console.error('Failed to load initial user data:', error);
            // Still set user to null but don't prevent the app from loading
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpForWaitlist = async (
    email: string,
    captchaToken?: string | null,
    shouldCreateUser: boolean = true
  ) => {
    // Create new user and send magic link
    const options: {
      captchaToken?: string;
      emailRedirectTo?: string;
      shouldCreateUser: boolean;
    } = {
      captchaToken: captchaToken || undefined,
      shouldCreateUser,
    };
    options.emailRedirectTo = import.meta.env.VITE_EMAIL_WELCOME_URL;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options,
    });
    if (!error) {
      await subscribeToNewsletter(email);
    }
    return { error };
  };

  const signUpWithMagicLink = async (
    email: string,
    captchaToken?: string | null
  ) => {
    // Create new user and send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        captchaToken: captchaToken || undefined,
      },
    });
    if (!error) {
      // Subscribe user to newsletter
      const { error: newsletterError } = await subscribeToNewsletter(email);
      if (newsletterError) {
        console.error('Newsletter subscription failed:', newsletterError);
      }
    }
    return { error };
  };

  const subscribeToNewsletter = async (email: string) => {
    const { error } = await resend.contacts.create({
      email,
      audienceId: 'c8cb077b-1d36-4b24-95e4-42ee7b5a59af',
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
        shouldCreateUser: false,
        captchaToken: captchaToken || undefined,
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.env.VITE_EMAIL_WELCOME_URL,
      },
    });
    return { error };
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: import.meta.env.VITE_EMAIL_WELCOME_URL,
      },
    });
    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: import.meta.env.VITE_EMAIL_WELCOME_URL,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUser = async () => {
    if (session?.user) {
      try {
        const user = await getUserFromAuth(session.user.id);
        setUser(user ?? null);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
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
    signInWithGoogle,
    signInWithGitHub,
    signInWithApple,
    signOut,
    refreshUser,
    isAuthModalOpen,
    authModalMode,
    showAuthModal,
    hideAuthModal,
    setAuthModalMode,
    signUpWithMagicLink,
    subscribeToNewsletter,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};
export default AuthProvider;
