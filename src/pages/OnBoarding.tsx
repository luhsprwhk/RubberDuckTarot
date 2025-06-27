import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import { ChevronRight, Zap, Brain, Target, Users, Bird } from 'lucide-react';
import useAuth from '../hooks/useAuth';

import { saveUserProfile, getUserProfile } from '../lib/userPreferences';
import { type UserProfile } from '../interfaces';
import { useNavigate } from 'react-router-dom';

const superpowers = [
  'Breaking complex problems into simple steps',
  'Seeing patterns others miss',
  'Finding creative workarounds',
  'Research and gathering information',
  'Getting people to open up and share',
  'Staying calm under pressure',
  'Learning new things quickly',
  'Other (specify below)',
];

const kryptonites = [
  'Overthinking simple decisions',
  'Getting distracted by new ideas',
  'Avoiding difficult conversations',
  'Perfectionism and never finishing',
  'Taking on too much at once',
  'Procrastinating on boring tasks',
  'Comparing myself to others',
  'Other (specify below)',
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
  'Decision (analysis paralysis)',
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

  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
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
            const loadedProfile = {
              name: existingProfile.name,
              birthday: existingProfile.birthday,
              birth_place: existingProfile.birth_place,
              profession: existingProfile.profession,
              debugging_mode: existingProfile.debugging_mode,
              block_pattern: existingProfile.block_pattern,
              superpower: existingProfile.superpower,
              kryptonite: existingProfile.kryptonite,
              spirit_animal: existingProfile.spirit_animal,
            };
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

  const updateProfile = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setRobMessage(steps[currentStep + 1].robMessage);
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
        name: profile.name,
        birthday: profile.birthday,
        birth_place: profile.birth_place,
        profession: profile.profession,
        debugging_mode: profile.debugging_mode,
        block_pattern: profile.block_pattern,
        superpower: profile.superpower,
        kryptonite: profile.kryptonite,
        spirit_animal: profile.spirit_animal,
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

  const isCustomSuperpower =
    profile.superpower && !superpowers.includes(profile.superpower);
  const superpowerSelection = isCustomSuperpower
    ? 'Other (specify below)'
    : profile.superpower;
  const showOtherSuperpower = superpowerSelection === 'Other (specify below)';
  const otherSuperpowerValue = isCustomSuperpower ? profile.superpower : '';

  const isCustomKryptonite =
    profile.kryptonite && !kryptonites.includes(profile.kryptonite);
  const kryptoniteSelection = isCustomKryptonite
    ? 'Other (specify below)'
    : profile.kryptonite;
  const showOtherKryptonite = kryptoniteSelection === 'Other (specify below)';
  const otherKryptoniteValue = isCustomKryptonite ? profile.kryptonite : '';

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
                className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:terminal-glow"
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
                className="w-full px-3 py-2 border text-primary border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:terminal-glow"
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
                    console.log(place);
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
                  className={`p-4 text-left border text-primary border-liminal-border rounded-lg transition-all ${
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
                        <option key={p} value={p}>
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
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className={`p-4 text-left border rounded-lg transition-all ${
                  profile.debugging_mode === mode
                    ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                    : 'border-liminal-border hover:border-gray-300 hover:bg-gray-50'
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
                className={`p-4 text-left border rounded-lg transition-all ${
                  profile.block_pattern === pattern
                    ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                    : 'border-liminal-border hover:border-gray-300 hover:bg-gray-50'
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline w-4 h-4 mr-1" />
              What's one thing you're actually good at figuring out?
            </label>
            <div className="relative">
              <select
                value={superpowerSelection || ''}
                onChange={(e) => updateProfile('superpower', e.target.value)}
                className="w-full p-4 border rounded-lg appearance-none bg-white border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500"
              >
                <option value="" disabled>
                  Select a superpower
                </option>
                {superpowers.map((superpower) => (
                  <option key={superpower} value={superpower}>
                    {superpower}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {showOtherSuperpower && (
              <textarea
                value={otherSuperpowerValue}
                onChange={(e) => updateProfile('superpower', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
                placeholder="Your debugging superpower..."
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              What consistently trips you up?
            </label>
            <div className="relative">
              <select
                value={kryptoniteSelection || ''}
                onChange={(e) => updateProfile('kryptonite', e.target.value)}
                className="w-full p-4 border rounded-lg appearance-none bg-white border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500"
              >
                <option value="" disabled>
                  Select a kryptonite
                </option>
                {kryptonites.map((kryptonite) => (
                  <option key={kryptonite} value={kryptonite}>
                    {kryptonite}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {showOtherKryptonite && (
              <textarea
                value={otherKryptoniteValue}
                onChange={(e) => updateProfile('kryptonite', e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-liminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
                placeholder="Your consistent kryptonite..."
              />
            )}
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
                  className={`p-4 text-left border rounded-lg transition-all flex items-center ${
                    profile.spirit_animal === animal.id
                      ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                      : 'border-liminal-border hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-6 h-6 mr-3 text-gray-600" />
                  {animal.name}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: 'Profile Complete',
      robMessage:
        "Perfect. I've got your debugging profile logged in my ethereal database. Now I can give you properly calibrated perspective shifts instead of generic fortune cookie wisdom. One last thing - I died avoiding bad business advice, so I promise to keep this practical. No cosmic energy nonsense, just good old-fashioned problem decomposition from beyond the grave.",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Rob's Assessment
            </h3>
            <div className="text-left space-y-2 text-sm text-gray-700">
              <p>
                <strong>Debugging Style:</strong> {profile.debugging_mode}
              </p>
              <p>
                <strong>Primary Block:</strong> {profile.block_pattern}
              </p>
              <p>
                <strong>Spirit Animal:</strong>{' '}
                {
                  spiritAnimals.find((a) => a.id === profile.spirit_animal)
                    ?.name
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleCompleteOnboarding}
            disabled={loading}
            className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'SAVING...' : 'START FIRST CONSULTATION'}
          </button>
        </div>
      ),
    },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.name && profile.birthday && profile.birth_place;
      case 1:
        return profile.profession;
      case 2:
        return profile.debugging_mode;
      case 3:
        return profile.block_pattern;
      case 4:
        return profile.superpower && profile.kryptonite;
      case 5:
        return profile.spirit_animal;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-void-gradient p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦆🧙‍♂️</div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Rubber Duck Tarot
          </h1>
          <div className="w-full bg-void-gradient rounded-full h-2 mb-4">
            <div
              className="bg-terminal-pulse h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-accent">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Rob's Message */}
        <div className="bg-void-800 rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🦆</div>
            <div className="flex-1">
              <div className="bg-void-700 rounded-lg p-4 relative">
                <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-100"></div>
                <p className="text-primary italic">{robMessage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-void-800 rounded-lg p-6 shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-primary mb-6">
            {steps[currentStep].title}
          </h2>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-end">
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                canProceed()
                  ? 'bg-breakthrough-400 text-primary hover:bg-breakthrough-500'
                  : 'bg-void-700 text-primary cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnBoarding;
