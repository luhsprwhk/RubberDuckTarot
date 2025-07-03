import { useState, useEffect } from 'react';
import { Save, User, Settings, Bell, Eye, Palette } from 'lucide-react';
import useAuth from '../lib/hooks/useAuth';
import { useUserProfile } from '../lib/hooks/useUserProfile';
import { updateUserProfile } from '../lib/userPreferences';
import { type UserProfile } from '../interfaces';
import { getZodiacSign } from '../lib/zodiacUtils';

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

const blockPatterns = ['creative', 'decision', 'work', 'life', 'relationship'];

const debuggingModes = [
  'step-by-step',
  'big-picture',
  'collaborative',
  'analytical',
  'intuitive',
];

const creativeIdentities = [
  'Developer with creative side projects',
  'Artist with a day job',
  'Entrepreneur building multiple things',
  'Creative professional in corporate world',
  'Founder/CEO questioning everything',
  'Career changer/pivoter',
  'Multi-passionate creative',
  'Burned out high achiever',
  'Student/early career figuring it out',
];

const workContexts = [
  'Tech/Engineering',
  'Design/Creative',
  'Business/Finance',
  'Healthcare',
  'Education',
  'Freelance/Consulting',
  'Between jobs',
  'Student',
];

const spiritAnimals = [
  'Wise Owl',
  'Clever Fox',
  'Determined Beaver',
  'Graceful Swan',
  'Loyal Dog',
  'Independent Cat',
  'Mighty Eagle',
  'Playful Dolphin',
  'Patient Turtle',
  'Curious Monkey',
];

const Preferences = () => {
  const { user } = useAuth();
  const { profile, loading, refreshProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [customSuperpower, setCustomSuperpower] = useState('');
  const [customKryptonite, setCustomKryptonite] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setCustomSuperpower(
        superpowers.includes(profile.superpower) ? '' : profile.superpower
      );
      setCustomKryptonite(
        kryptonites.includes(profile.kryptonite) ? '' : profile.kryptonite
      );
    }
  }, [profile]);

  const handleInputChange = (
    field: keyof UserProfile,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Automatically calculate zodiac sign when birthday is updated
      if (field === 'birthday' && value && typeof value === 'string') {
        updated.zodiac_sign = getZodiacSign(value);
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      setSaveMessage('');

      const updatedProfile = {
        ...formData,
        superpower:
          formData.superpower === 'Other (specify below)'
            ? customSuperpower
            : formData.superpower,
        kryptonite:
          formData.kryptonite === 'Other (specify below)'
            ? customKryptonite
            : formData.kryptonite,
      };

      await updateUserProfile(user.id, updatedProfile);
      await refreshProfile();
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Failed to save profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Profile Found
          </h2>
          <p className="text-gray-600">
            Please complete your onboarding to access preferences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferences</h1>
        <p className="text-gray-600">Manage your profile and app preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  value={formData.birthday || ''}
                  onChange={(e) =>
                    handleInputChange('birthday', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Place
                </label>
                <input
                  type="text"
                  value={formData.birth_place || ''}
                  onChange={(e) =>
                    handleInputChange('birth_place', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Creative Identity
                </label>
                <select
                  value={formData.creative_identity || ''}
                  onChange={(e) =>
                    handleInputChange('creative_identity', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select your creative identity
                  </option>
                  {creativeIdentities.map((identity) => (
                    <option key={identity} value={identity}>
                      {identity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Work Context
                </label>
                <select
                  value={formData.work_context || ''}
                  onChange={(e) =>
                    handleInputChange('work_context', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select your work context
                  </option>
                  {workContexts.map((context) => (
                    <option key={context} value={context}>
                      {context}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Debugging Mode
                </label>
                <select
                  value={formData.debugging_mode || ''}
                  onChange={(e) =>
                    handleInputChange('debugging_mode', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {debuggingModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() +
                        mode.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Block Pattern
                </label>
                <select
                  value={formData.block_pattern || ''}
                  onChange={(e) =>
                    handleInputChange('block_pattern', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {blockPatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spirit Animal
                </label>
                <select
                  value={formData.spirit_animal || ''}
                  onChange={(e) =>
                    handleInputChange('spirit_animal', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {spiritAnimals.map((animal) => (
                    <option key={animal} value={animal}>
                      {animal}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superpower
              </label>
              <select
                value={formData.superpower || ''}
                onChange={(e) =>
                  handleInputChange('superpower', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {superpowers.map((power) => (
                  <option key={power} value={power}>
                    {power}
                  </option>
                ))}
              </select>
              {formData.superpower === 'Other (specify below)' && (
                <input
                  type="text"
                  value={customSuperpower}
                  onChange={(e) => setCustomSuperpower(e.target.value)}
                  placeholder="Please specify your superpower"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kryptonite
              </label>
              <select
                value={formData.kryptonite || ''}
                onChange={(e) =>
                  handleInputChange('kryptonite', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {kryptonites.map((kryptonite) => (
                  <option key={kryptonite} value={kryptonite}>
                    {kryptonite}
                  </option>
                ))}
              </select>
              {formData.kryptonite === 'Other (specify below)' && (
                <input
                  type="text"
                  value={customKryptonite}
                  onChange={(e) => setCustomKryptonite(e.target.value)}
                  placeholder="Please specify your kryptonite"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* App Preferences Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                App Preferences
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Reading History
                  </p>
                  <p className="text-sm text-gray-500">
                    Save your insights for future reference
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Daily Insights
                  </p>
                  <p className="text-sm text-gray-500">
                    Get reminded to draw your daily card
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveMessage && (
              <p
                className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}
              >
                {saveMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
