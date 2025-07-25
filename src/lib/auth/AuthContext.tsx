import { createContext } from 'react';
import type { Session, AuthError } from '@supabase/supabase-js';
import type { User } from '../../interfaces';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpForWaitlist: (
    email: string,
    captchaToken?: string | null,
    shouldCreateUser?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signUpWithMagicLink: (
    email: string,
    captchaToken?: string | null,
    shouldCreateUser?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (
    email: string,
    captchaToken?: string | null,
    shouldCreateUser?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  // signInWithTwitter: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signIn' | 'signUp';
  showAuthModal: (mode: 'signIn' | 'signUp') => void;
  hideAuthModal: () => void;
  setAuthModalMode: (mode: 'signIn' | 'signUp') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
