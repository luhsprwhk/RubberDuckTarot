import { useState, useEffect, useRef } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useAuth from '../lib/hooks/useAuth';
import useAlert from '../lib/hooks/useAlert';
import { isWaitlistEnabled } from '../lib/featureFlags';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    hideAuthModal,
    authModalMode,
    // setAuthModalMode,
    signUpForWaitlist,
    signInWithMagicLink,
    signUpWithMagicLink,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-center">
                    <HCaptcha
                      ref={captchaRef}
                      sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={(error) => {
                        console.error('hCaptcha error:', error);
                        setCaptchaToken(null);
                      }}
                      theme="dark"
                    />
                  </div>
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
                        className="w-full text-primary pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-700">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !captchaToken}
                    className="w-full bg-breakthrough-500 text-dark   py-2 px-4 rounded-md hover:bg-breakthrough-400 focus:outline-none focus:ring-2 focus:ring-breakthrough-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Sending...'
                      : isSignUp && !isWaitlistEnabled()
                        ? 'Send Magic Link'
                        : 'Send Magic Link'}
                  </button>
                </form>

                {/*         <div className="mt-6 text-center">
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:text-secondary text-sm"
                  >
                    {isSignUp
                      ? 'Already on the waitlist? Sign in'
                      : 'New to Rubber Duck Tarot? Join waitlist'}
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
