import { useState, useEffect, useRef } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useAuth from '../lib/hooks/useAuth';
import useAlert from '../lib/hooks/useAlert';
import { isWaitlistEnabled } from '../lib/featureFlags';

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
  <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
  provider: 'google' | 'github' | 'apple';
  onClick: (provider: 'google' | 'github' | 'apple') => void;
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
    signInWithGitHub,
    signInWithApple,
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

  const handleSocialAuth = async (provider: 'google' | 'github' | 'apple') => {
    setError('');
    setLoading(true);

    try {
      let authError;
      switch (provider) {
        case 'google':
          ({ error: authError } = await signInWithGoogle());
          break;
        case 'github':
          ({ error: authError } = await signInWithGitHub());
          break;
        case 'apple':
          ({ error: authError } = await signInWithApple());
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
                <div className="flex justify-between items-center mb-6">
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

                      {!isSignUp && (
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
                      )}

                      {/* Social Auth Buttons */}
                      {!isSignUp && (
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
                          <SocialButton
                            provider="github"
                            onClick={handleSocialAuth}
                            loading={loading}
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                          </SocialButton>
                          <SocialButton
                            provider="apple"
                            onClick={handleSocialAuth}
                            loading={loading}
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z" />
                              <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                            Continue with Apple
                          </SocialButton>
                        </div>
                      )}
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
