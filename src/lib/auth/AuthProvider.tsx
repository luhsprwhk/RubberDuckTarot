import { useState, useEffect, useCallback } from 'react';
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

  const subscribeToNewsletter = async (email: string) => {
    const { error } = await resend.contacts.create({
      email,
      audienceId: 'c8cb077b-1d36-4b24-95e4-42ee7b5a59af',
    });
    return { error };
  };

  const handleNewsletterSubscription = useCallback(async (email: string) => {
    const { error: newsletterError } = await subscribeToNewsletter(email);
    if (newsletterError) {
      console.error('Newsletter subscription failed:', newsletterError);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      let timeoutId: NodeJS.Timeout | undefined;

      try {
        setLoading(true);

        // Add timeout to prevent auth hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Auth initialization timeout'));
          }, 15000); // 15 second timeout for auth
        });

        const authPromise = supabase.auth
          .getSession()
          .then(async ({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
              try {
                const user = await getUserFromAuth(session.user.id);
                return user ?? null;
              } catch (error) {
                console.error('Failed to load initial user data:', error);
                return null;
              }
            }
            return null;
          });

        const user = await Promise.race([authPromise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        setUser(user);
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error('Error initializing auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session);
        if (session?.user) {
          const userProfile = await getUserFromAuth(session.user.id);
          setUser(userProfile ?? null);

          // If the user just signed in and doesn't have a profile, they are a new user.
          if (event === 'SIGNED_IN' && !userProfile) {
            if (session.user.email) {
              await handleNewsletterSubscription(session.user.email);
            }
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
  }, [handleNewsletterSubscription]);

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
      await handleNewsletterSubscription(email);
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
      await handleNewsletterSubscription(email);
    }
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
    });
    return { error };
  };

  // TODO: Enable Twitter auth
  // const signInWithTwitter = async () => {
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'twitter',
  //   });
  //   return { error };
  // };

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
    // signInWithTwitter,
    signOut,
    refreshUser,
    isAuthModalOpen,
    authModalMode,
    showAuthModal,
    hideAuthModal,
    setAuthModalMode,
    signUpWithMagicLink,
    subscribeToNewsletter,
    handleNewsletterSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};
export default AuthProvider;
