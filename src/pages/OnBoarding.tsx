import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import { ChevronRight, Zap, Brain, Target, Users, Bird } from 'lucide-react';
import useAuth from '../lib/hooks/useAuth';

import { saveUserProfile, getUserProfile } from '../lib/userPreferences';
import { type UserProfile } from '../interfaces';
import { useNavigate } from 'react-router-dom';
import robEmoji from '../assets/rob-emoji.png';

const superpowers = [
  'Breaking complex problems into simple steps',
  'Seeing patterns others miss',
  'Finding creative workarounds',
  'Research and gathering information',
  'Getting people to open up and share',
  'Staying calm under pressure',
  'Learning new things quickly',
];

const kryptonites = [
  'Overthinking simple decisions',
  'Getting distracted by new ideas',
  'Avoiding difficult conversations',
  'Perfectionism and never finishing',
  'Taking on too much at once',
  'Procrastinating on boring tasks',
  'Comparing myself to others',
];

const techProfessions = [
  'Dev',
  'Designer',
  'PM',
  'Marketing',
  'Manager',
  'Sales',
  'Executive',
  'Founder',
  'Intern',
  'Other',
];

const creativeProfessions = [
  'Artist',
  'Writer',
  'Musician',
  'Filmmaker',
  'Dancer',
  'Actor',
  'Other',
];
const healthcareProfessions = [
  'Doctor',
  'Nurse',
  'Therapist',
  'Researcher',
  'Administrator',
  'Educator',
  'Other',
];
const businessProfessions = [
  'Analyst',
  'Consultant',
  'Accountant',
  'HR',
  'Operations',
  'Sales',
  'Marketing',
  'Other',
];
const studentProfessions = [
  'High School',
  'Undergraduate',
  'Graduate',
  'PhD Candidate',
  'Bootcamp',
  'Other',
];

const professionsByCategory: { [key: string]: string[] } = {
  'Tech (Dev/Design/PM)': techProfessions,
  'Creative (Artist/Writer/Creator)': creativeProfessions,
  'Healthcare/Education': healthcareProfessions,
  'Business/Finance': businessProfessions,
  Student: studentProfessions,
  Other: [],
};

const professionCategories = [
  'Tech (Dev/Design/PM)',
  'Creative (Artist/Writer/Creator)',
  'Healthcare/Education',
  'Business/Sales/Finance',
  'Trades/Service Work',
  'Student/Career Starter',
  'Other',
];

const debuggingModes = [
  'Panic and Google everything',
  'Overthink until paralyzed',
  'Ask everyone for advice',
  'Ignore it and hope it fixes itself',
  'Break it down step by step',
];

const blockPatterns = [
  'Creative (stuck on projects)',
  'Work (career confusion)',
  'Life (routine ruts)',
  'Relationship (communication failures)',
];

const spiritAnimals = [
  { id: 'eagle', name: '🦅 Eagle (big picture)', icon: Bird },
  { id: 'ant', name: '🐜 Ant (detail-oriented)', icon: Brain },
  { id: 'fox', name: '🦊 Fox (creative solutions)', icon: Zap },
  { id: 'turtle', name: '🐢 Turtle (methodical)', icon: Target },
  { id: 'wolf', name: '🐺 Wolf (collaborative)', icon: Users },
];

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
    profession: {
      category: '',
      name: '',
    },
    debugging_mode: '',
    block_pattern: '',
    superpower: '',
    kryptonite: '',
    spirit_animal: '',
  });

  const [isOtherProfession, setIsOtherProfession] = useState(false);

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

            if (loadedProfile.profession && loadedProfile.profession.category) {
              const { category, name } = loadedProfile.profession;
              const categoryProfessions = professionsByCategory[category];
              if (
                !categoryProfessions ||
                categoryProfessions.length === 0 ||
                !categoryProfessions.includes(name)
              ) {
                setIsOtherProfession(true);
              } else {
                setIsOtherProfession(false);
              }
            }
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
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const professionNameSelection =
    isOtherProfession ||
    (profile.profession.category &&
      profile.profession.name &&
      !professionsByCategory[profile.profession.category]?.includes(
        profile.profession.name
      ))
      ? 'Other'
      : profile.profession.name;

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
      title: 'Profession Assessment',
      robMessage:
        "What's your day job? This helps me calibrate my metaphor game.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {professionCategories
              .filter(
                (category) =>
                  !profile.profession.category ||
                  category === profile.profession.category
              )
              .map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    updateProfile('profession', {
                      category: category,
                      name: '',
                    });
                    setIsOtherProfession(
                      professionsByCategory[category]?.length === 0
                    );
                  }}
                  className={`p-4 text-left border text-primary bg-liminal-overlay  border-liminal-border rounded-lg transition-all ${
                    profile.profession.category === category
                      ? 'border-terminal-pulse bg-terminal-pulse ring-2 ring-terminal-pulse'
                      : 'border-liminal-border hover:border-terminal-pulse hover:bg-terminal-pulse'
                  }`}
                >
                  {category}
                </button>
              ))}
          </div>
          {profile.profession.category && (
            <div className="grid grid-cols-1 gap-3">
              {!isOtherProfession &&
                professionsByCategory[profile.profession.category]?.length >
                  0 && (
                  <select
                    value={professionNameSelection}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setIsOtherProfession(true);
                        updateProfile('profession', {
                          ...profile.profession,
                          name: '',
                        });
                      } else {
                        setIsOtherProfession(false);
                        updateProfile('profession', {
                          ...profile.profession,
                          name: e.target.value,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-void-800 text-primary border border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:terminal-glow"
                  >
                    <option value="" disabled>
                      Select your profession
                    </option>
                    {professionsByCategory[profile.profession.category].map(
                      (p) => (
                        <option key={p} value={p} className="text-primary">
                          {p}
                        </option>
                      )
                    )}
                  </select>
                )}

              {isOtherProfession && (
                <input
                  type="text"
                  value={profile.profession.name}
                  onChange={(e) =>
                    updateProfile('profession', {
                      ...profile.profession,
                      name: e.target.value,
                    })
                  }
                  onBlur={() => setIsOtherProfession(false)}
                  className="w-full px-3 py-2 border border-liminal-border bg-void-800 text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="What's your profession?"
                  autoFocus
                />
              )}
            </div>
          )}
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

      await saveUserProfile(dbProfile);
      navigate('/');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save your preferences. Please try again.');
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
          profile.profession.category.trim() !== '' &&
          profile.profession.name.trim() !== ''
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
