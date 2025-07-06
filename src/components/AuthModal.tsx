import { useState, useEffect, useRef } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
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
  } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const { showInfo } = useAlert();

  const isSignUp = authModalMode === 'signUp';

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

    try {
      const { error: authError } = isSignUp
        ? await signUpForWaitlist(email, captchaToken)
        : await signInWithMagicLink(email, captchaToken);

      if (authError) {
        setError(authError.message);
      } else {
        showInfo(
          'Please check your email and click the magic link to complete your registration.',
          'Check Your Email'
        );
        hideAuthModal();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {isSignUp && !isWaitlistEnabled() ? 'Join the Waitlist' : 'Sign In'}
          </h2>
          <button
            onClick={hideAuthModal}
            className="text-secondary hover:text-primary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full bg-breakthrough-500 text-dark   py-2 px-4 rounded-md hover:bg-breakthrough-400 focus:outline-none focus:ring-2 focus:ring-breakthrough-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Sending...'
              : isSignUp && !isWaitlistEnabled()
                ? 'Join Waitlist'
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
            By joining the waitlist, you'll be notified when Rubber Duck Tarot
            is ready.
          </p>
        )}
      </div>
    </div>
  );
};
