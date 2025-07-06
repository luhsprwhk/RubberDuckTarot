import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import { ChevronRight, Zap, Target } from 'lucide-react';
import useAuth from '../lib/hooks/useAuth';

import { saveUserProfile, getUserProfile } from '../lib/userPreferences';
import { type UserProfile } from '../interfaces';
import { useNavigate } from 'react-router-dom';
import { getZodiacSign } from '../lib/zodiacUtils';
import robEmoji from '../assets/rob-emoji.png';

import {
  superpowers,
  kryptonites,
  creativeIdentities,
  workContexts,
  debuggingModes,
  blockPatterns,
  spiritAnimals,
} from '../lib/userProfileValues';

const OnBoarding = () => {
  const [isGoogleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        setGoogleMapsLoaded(true);
      })
      .catch((e) => {
        console.error(
          'Failed to load Google Maps script. Please check your API key and network connection.',
          e
        );
      });
  }, []);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<
    Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  >({
    name: '',
    birthday: '',
    birth_place: '',
    creative_identity: '',
    work_context: '',
    zodiac_sign: '',
    debugging_mode: '',
    block_pattern: '',
    superpower: '',
    kryptonite: '',
    spirit_animal: '',
  });

  const [robMessage, setRobMessage] = useState(
    "Welcome to the Rubber Duck Tarot. I'm Rob, a dead developer who got stuck in this rubber duck after avoiding one too many startup pitches. It's a long story. Anyway, now I help the living debug their life problems."
  );

  // Load existing profile if user is logged in
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const existingProfile = await getUserProfile(user.id);
          if (existingProfile) {
            const { ...loadedProfile } = existingProfile;
            setProfile(loadedProfile);
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
    };
    loadProfile();
  }, [user]);

  // Check if user is authenticated after all hooks
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const updateProfile = <K extends keyof typeof profile>(
    field: K,
    value: (typeof profile)[K]
  ) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };

      // Automatically calculate zodiac sign when birthday is updated
      if (field === 'birthday' && value && typeof value === 'string') {
        updated.zodiac_sign = getZodiacSign(value);
      }

      return updated;
    });
  };

  const steps = [
    {
      title: "Rob's Business Introduction",
      robMessage:
        "Before we start breaking your mental loops, I need some intel. This isn't mystical nonsense - it's just good consulting practice. Even in the afterlife, I believe in proper client onboarding.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:border-breakthrough-400 focus:ring-breakthrough-400"
                placeholder="What should I call you?"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Birthday
              </label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => updateProfile('birthday', e.target.value)}
                className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:border-breakthrough-400 focus:ring-breakthrough-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Place of Birth
              </label>
              {isGoogleMapsLoaded && (
                <PlacesAutocomplete
                  initialValue={profile.birth_place}
                  onPlaceSelect={(place) => {
                    if (place.formatted_address) {
                      updateProfile('birth_place', place.formatted_address);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Creative Identity & Work Context',
      robMessage:
        "Let's understand your creative identity and work context. This helps me tune my insights to your unique situation.",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Creative Identity
            </label>
            <select
              className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:border-breakthrough-400 focus:ring-breakthrough-400"
              value={profile.creative_identity}
              onChange={(e) =>
                updateProfile('creative_identity', e.target.value)
              }
            >
              <option value="">Select your creative identity...</option>
              {creativeIdentities.map((identity) => (
                <option key={identity} value={identity}>
                  {identity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Work Context
            </label>
            <select
              className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:border-breakthrough-400 focus:ring-breakthrough-400"
              value={profile.work_context}
              onChange={(e) => updateProfile('work_context', e.target.value)}
            >
              <option value="">Select your work context...</option>
              {workContexts.map((context) => (
                <option key={context} value={context}>
                  {context}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: 'Default Debugging Mode',
      robMessage:
        "When things go wrong, what's your usual approach? No judgment here - I've seen every antipattern in the book.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {debuggingModes.map((mode) => (
              <button
                key={mode}
                onClick={() => updateProfile('debugging_mode', mode)}
                className={`p-4 text-left text-primary border rounded-lg transition-all ${
                  profile.debugging_mode === mode
                    ? 'border-terminal-pulse bg-terminal-pulse ring-2 ring-terminal-pulse'
                    : 'border-liminal-border hover:border-terminal-pulse hover:bg-terminal-pulse'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Primary Block Pattern',
      robMessage:
        'What type of blocks do you hit most often? This helps me tune my divination algorithm.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {blockPatterns.map((pattern) => (
              <button
                key={pattern}
                onClick={() => updateProfile('block_pattern', pattern)}
                className={`p-4 text-left text-primary border rounded-lg transition-all ${
                  profile.block_pattern === pattern
                    ? 'border-terminal-pulse bg-terminal-pulse ring-2 ring-terminal-pulse'
                    : 'border-liminal-border hover:border-terminal-pulse hover:bg-terminal-pulse'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Debugging Superpower & Kryptonite',
      robMessage:
        'Every good debugger has strengths and blind spots. What consistently works for you, and what always trips you up?',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              <Zap className="inline w-4 h-4 mr-1" />
              What's one thing you're actually good at figuring out?
            </label>
            <div className="relative">
              <select
                value={profile.superpower || ''}
                onChange={(e) => updateProfile('superpower', e.target.value)}
                className="w-full p-4 border rounded-lg text-primary appearance-none bg-void-800 border-liminal-border hover:border-terminal-pulse focus:outline-none focus:ring-2 focus:ring-terminal-pulse focus:border-terminal-pulse"
              >
                <option value="" disabled>
                  Select a superpower
                </option>
                {superpowers.map((superpower) => (
                  <option
                    key={superpower}
                    value={superpower}
                    className="text-primary bg-void-800"
                  >
                    {superpower}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              What consistently trips you up?
            </label>
            <div className="relative">
              <select
                value={profile.kryptonite || ''}
                onChange={(e) => updateProfile('kryptonite', e.target.value)}
                className="w-full p-4 border bg-void-800 rounded-lg text-primary appearance-none border-liminal-border hover:border-terminal-pulse focus:outline-none focus:ring-2 focus:ring-terminal-pulse focus:border-terminal-pulse"
              >
                <option value="" disabled className="text-primary bg-void-800">
                  Select a kryptonite
                </option>
                {kryptonites.map((kryptonite) => (
                  <option
                    key={kryptonite}
                    value={kryptonite}
                    className="text-primary bg-void-800"
                  >
                    {kryptonite}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
                <svg
                  className="fill-current h-4 w-4 text-primary bg-void-800"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Problem-Solving Spirit Animal',
      robMessage:
        'Which vibe matches your style? This affects how I frame solutions for you.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {spiritAnimals.map((animal) => {
              const IconComponent = animal.icon;
              return (
                <button
                  key={animal.id}
                  onClick={() => updateProfile('spirit_animal', animal.id)}
                  className={`p-4 text-left border rounded-lg transition-all flex items-center text-primary ${
                    profile.spirit_animal === animal.id
                      ? 'border-terminal-pulse bg-terminal-pulse ring-2 ring-terminal-pulse'
                      : 'border-liminal-border hover:border-terminal-pulse hover:bg-terminal-pulse'
                  }`}
                >
                  <IconComponent className="w-6 h-6 mr-3" />
                  {animal.name}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setRobMessage(
        steps[currentStep + 1]?.robMessage || "Let's wrap this up."
      );
    }
  };

  // Helper to add a timeout to any promise
  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            'Request timed out. Please check your connection and try again.'
          )
        );
      }, ms);
      promise
        .then((res) => {
          clearTimeout(timeoutId);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  const handleCompleteOnboarding = async () => {
    if (!user) {
      alert('Please sign in to save your preferences');
      return;
    }

    setLoading(true);
    try {
      const dbProfile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        ...profile,
      };
      // Add a 10 second timeout to the save operation
      await withTimeout(saveUserProfile(dbProfile), 10000);
      navigate('/');
      window.location.reload();
    } catch (error) {
      // Log more context for debugging
      console.error('Failed to save profile:', { error, user, profile });
      // Show a user-friendly error message
      if (error instanceof Error && error.message.includes('timed out')) {
        alert(
          'Saving your profile took too long. Please check your internet connection and try again.'
        );
      } else {
        alert('Failed to save your preferences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return (
          profile.name.trim() !== '' &&
          profile.birthday !== '' &&
          profile.birth_place.trim() !== ''
        );
      case 1:
        return (
          profile.creative_identity.trim() !== '' &&
          profile.work_context.trim() !== ''
        );
      case 2:
        return profile.debugging_mode.trim() !== '';
      case 3:
        return profile.block_pattern.trim() !== '';
      case 4:
        return (
          profile.superpower.trim() !== '' && profile.kryptonite.trim() !== ''
        );
      case 5:
        return profile.spirit_animal.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-void-gradient p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span role="img" aria-label="clipboard" className="text-6xl">
              📋
            </span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Onboarding</h1>
          <div className="w-full bg-void-gradient rounded-full h-2 mb-4">
            <div
              className="bg-breakthrough-400  h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / (steps.length + 1)) * 100}%`,
              }}
            />
          </div>
          <p className="text-accent">
            Step {currentStep + 1} of {steps.length + 1}
          </p>
        </div>

        <div className="bg-liminal-surface border-liminal-border rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex items-start">
            <div className="mr-4">
              <img src={robEmoji} alt="Rob" className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="bg-liminal-overlay border-liminal-border rounded-lg p-4 relative">
                <p className="text-primary italic">{robMessage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-liminal-surface border-liminal-border rounded-lg p-6 shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-primary mb-6">
            {steps[currentStep].title}
          </h2>
          {steps[currentStep].content}
        </div>

        <div className="mt-8 flex justify-end">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className="flex items-center justify-center px-6 py-3 bg-breakthrough-400 text-primary font-bold rounded-lg shadow-lg hover:bg-opacity-90 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:text-primary disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>Continue</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleCompleteOnboarding}
              disabled={!isStepComplete() || loading}
              className="flex items-center justify-center px-6 py-3 bg-breakthrough-400 text-primary font-bold rounded-lg shadow-lg hover:bg-opacity-90 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:text-primary disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Saving...' : 'Complete & See Your Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
