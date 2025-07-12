import { useState, useEffect, useRef } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useAuth from '../lib/hooks/useAuth';
import useAlert from '../lib/hooks/useAlert';
import { isWaitlistEnabled } from '../lib/featureFlags';
import robEmoji from '../assets/rob-emoji.png';

const EmailAuthForm = ({
  handleSubmit,
  loading,
  email,
  setEmail,
  error,
  isSignUp,
}: {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  error: string;
  isSignUp: boolean;
}) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Email Address
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-primary pl-10 pr-3 py-2 border border-liminal-border rounded-md focus:outline-none focus:ring-2 ring-offset-surface focus:ring-breakthrough-500 bg-void-900 ring-offset-2"
          placeholder="your@email.com"
          required
        />
      </div>
    </div>

    {error && (
      <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3 flex items-center text-red-400">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-breakthrough-500 text-void-950 font-bold py-2 px-4 rounded-md hover:bg-breakthrough-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-surface focus:ring-breakthrough-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow hover:shadow-pulse"
    >
      {loading
        ? 'Sending...'
        : isSignUp && !isWaitlistEnabled()
          ? 'Send Magic Link'
          : 'Send Magic Link'}
    </button>
  </form>
);

const SocialButton = ({
  provider,
  onClick,
  loading,
  children,
}: {
  provider: 'google' | 'twitter';
  onClick: (provider: 'google' | 'twitter') => void;
  loading: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={() => onClick(provider)}
    disabled={loading}
    className="w-full cursor-pointer flex items-center justify-center px-4 py-2 border border-liminal-border rounded-md shadow-sm text-sm font-medium text-primary bg-surface hover:bg-liminal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-breakthrough-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    hideAuthModal,
    authModalMode,
    // setAuthModalMode,
    signUpForWaitlist,
    signInWithMagicLink,
    signUpWithMagicLink,
    signInWithGoogle,
    signInWithTwitter,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const captchaRef = useRef<HCaptcha | null>(null);

  const { showInfo } = useAlert();

  const isSignUp = authModalMode === 'signUp';
  const isSignIn = authModalMode === 'signIn';

  const resetForm = () => {
    setEmail('');
    setError('');
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      resetForm();
    }
  }, [isAuthModalOpen]);

  /*   const toggleMode = () => {
    setAuthModalMode(isSignUp ? 'signIn' : 'signUp');
    resetForm();
  }; */

  if (!isAuthModalOpen) return null;

  const handleVerifyCaptcha = (token: string) => {
    setCaptchaToken(token);
    setIsCaptchaVerified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const waitlistEnabled = import.meta.env.VITE_ENABLE_WAITLIST === 'true';
    try {
      let authError;
      if (isSignUp) {
        if (waitlistEnabled) {
          ({ error: authError } = await signUpForWaitlist(email, captchaToken));
        } else {
          ({ error: authError } = await signUpWithMagicLink(
            email,
            captchaToken
          ));
        }
      } else {
        ({ error: authError } = await signInWithMagicLink(email, captchaToken));
      }

      if (authError) {
        setError(authError.message);
      } else {
        if (isSignUp && waitlistEnabled) {
          showInfo(
            "Check your email - Rob's sending your waitlist confirmation",
            'Added to Waitlist'
          );
        } else {
          showInfo(
            isSignUp
              ? 'Check your email - Rob is dispatching your magic link from beyond the veil'
              : 'Welcome back - check your email for the magic link to login.',
            'Check Your Email'
          );
        }
        hideAuthModal();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'twitter') => {
    setError('');
    setLoading(true);

    try {
      let authError;
      switch (provider) {
        case 'google':
          ({ error: authError } = await signInWithGoogle());
          break;

        case 'twitter':
          ({ error: authError } = await signInWithTwitter());
          break;
      }

      if (authError) {
        setError(authError.message);
      } else {
        hideAuthModal();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isAuthModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={hideAuthModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-surface rounded-lg max-w-md w-full p-6 text-left align-middle shadow-xl transform transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-2xl font-bold text-primary">
                    {isSignIn
                      ? 'Sign In'
                      : isSignUp && isWaitlistEnabled()
                        ? 'Join the Waitlist'
                        : 'Sign Up'}
                  </Dialog.Title>
                  <button
                    onClick={hideAuthModal}
                    className="text-secondary hover:text-primary"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 pb-0">
                  {!isCaptchaVerified ? (
                    <div className="flex justify-center items-center h-full">
                      <HCaptcha
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY!}
                        onVerify={handleVerifyCaptcha}
                        ref={captchaRef}
                        theme="dark"
                      />
                      <img
                        src={robEmoji}
                        alt=""
                        className="w-20 h-20 mb-6 mx-auto"
                      />
                    </div>
                  ) : (
                    <>
                      <EmailAuthForm
                        handleSubmit={handleSubmit}
                        loading={loading}
                        email={email}
                        setEmail={setEmail}
                        error={error}
                        isSignUp={isSignUp}
                      />

                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-surface text-accent font-semibold">
                            Or continue with social
                          </span>
                        </div>
                      </div>

                      {/* Social Auth Buttons */}
                      <div className="space-y-3 mb-6 mt-6">
                        <SocialButton
                          provider="google"
                          onClick={handleSocialAuth}
                          loading={loading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </SocialButton>
                        {/*                         <SocialButton
                          provider="twitter"
                          onClick={handleSocialAuth}
                          loading={loading}
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          Continue with X
                        </SocialButton> */}
                      </div>
                    </>
                  )}
                </div>

                {/*         <div className="mt-6 text-center">
                  <button
                    onClick={toggleMode}
                    className="text-sm font-semibold text-accent hover:text-white"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Sign Up"}
                  </button>
                </div> */}

                {isSignUp && !isWaitlistEnabled() && (
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Rob's waiting in the ethereal realm to help you debug your
                    next block. Fair warning: he's brutally honest about bad
                    decisions
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
