import { createContext } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signIn' | 'signUp';
  showAuthModal: (mode: 'signIn' | 'signUp') => void;
  hideAuthModal: () => void;
  setAuthModalMode: (mode: 'signIn' | 'signUp') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
