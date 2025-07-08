import { useState, useEffect } from 'react';
import { Save, User, Settings, Eye, BookOpen } from 'lucide-react';
import useAuth from '../lib/hooks/useAuth';
import { useUserProfile } from '../lib/hooks/useUserProfile';
import { updateUserProfile } from '../lib/userPreferences';
import { type UserProfile } from '../interfaces';
import { getZodiacSign } from '../lib/zodiacUtils';
import { Link } from 'react-router-dom';
import {
  superpowers,
  kryptonites,
  creativeIdentities,
  workContexts,
  debuggingModes,
  blockPatterns,
  spiritAnimals,
} from '../lib/userProfileValues';
import { NotionService } from '../lib/notion/notion-service';

const Preferences = () => {
  const { user } = useAuth();
  const { profile, loading, refreshProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [customSuperpower, setCustomSuperpower] = useState('');
  const [customKryptonite, setCustomKryptonite] = useState('');
  const [connectingNotion, setConnectingNotion] = useState(false);

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

  const handleNotionConnect = async () => {
    if (!user?.premium) {
      setSaveMessage('Notion integration is only available for premium users.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      setConnectingNotion(true);
      const authUrl = await NotionService.initiateOAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Notion:', error);
      setSaveMessage('Failed to connect to Notion. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setConnectingNotion(false);
    }
  };

  const isNotionConnected =
    user?.notion_access_token && user?.notion_workspace_id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <NoProfileFound />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">
          Preferences
        </h1>
        <p className="text-secondary">
          Manage your profile and app preferences
        </p>
      </div>

      <div className="space-y-12">
        {/* Profile Section */}
        <div className="bg-surface rounded-xl shadow-breakthrough border border-liminal-border backdrop-blur-liminal">
          <div className="px-6 py-4 border-b border-liminal-border/70">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-breakthrough-500" />
              <h2 className="text-lg font-semibold text-primary">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  value={formData.birthday || ''}
                  onChange={(e) =>
                    handleInputChange('birthday', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Birth Place
                </label>
                <input
                  type="text"
                  value={formData.birth_place || ''}
                  onChange={(e) =>
                    handleInputChange('birth_place', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
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
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
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
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
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
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
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
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
                >
                  {blockPatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Spirit Animal
                </label>
                <select
                  value={formData.spirit_animal || ''}
                  onChange={(e) =>
                    handleInputChange('spirit_animal', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
                >
                  {spiritAnimals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Superpower
              </label>
              <select
                value={formData.superpower || ''}
                onChange={(e) =>
                  handleInputChange('superpower', e.target.value)
                }
                className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
              >
                {superpowers.map((power) => (
                  <option key={power} value={power}>
                    {power}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Kryptonite
              </label>
              <select
                value={formData.kryptonite || ''}
                onChange={(e) =>
                  handleInputChange('kryptonite', e.target.value)
                }
                className="w-full px-3 py-2 border border-liminal-border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-breakthrough-400 focus:border-breakthrough-400 transition"
              >
                {kryptonites.map((kryptonite) => (
                  <option key={kryptonite} value={kryptonite}>
                    {kryptonite}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* App Preferences Section */}
        <div className="bg-surface rounded-xl shadow-breakthrough border border-liminal-border backdrop-blur-liminal">
          <div className="px-6 py-4 border-b border-liminal-border/70">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-breakthrough-500" />
              <h2 className="text-lg font-semibold text-primary">
                App Preferences
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-breakthrough-500" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Reading History
                  </p>
                  <p className="text-xs text-secondary">
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
                <div className="w-11 h-6 bg-liminal-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-breakthrough-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary after:border-liminal-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-breakthrough-500"></div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-breakthrough-500" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Connect to Notion
                  </p>
                  <p className="text-xs text-secondary">
                    {user?.premium
                      ? 'Export your insights directly to Notion'
                      : 'Available for premium users only'}
                  </p>
                </div>
              </div>

              {isNotionConnected ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">
                    Connected
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleNotionConnect}
                  disabled={!user?.premium || connectingNotion}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    user?.premium
                      ? 'bg-breakthrough-500 text-primary hover:bg-breakthrough-600 focus:ring-2 focus:ring-breakthrough-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {connectingNotion ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveMessage && (
              <p
                className={`text-sm ${saveMessage.includes('success') ? 'text-breakthrough-600' : 'text-red-500'}`}
              >
                {saveMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-breakthrough-500 text-primary rounded-lg shadow-glow hover:bg-breakthrough-600 transition disabled:opacity-50 disabled:cursor-not-allowed border border-liminal-border"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Save className="h-4 w-4 text-primary" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * A visually engaging component shown when no user profile is found.
 */
const NoProfileFound = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-surface rounded-xl shadow-glow border border-liminal-border mt-16">
      <div className="flex flex-col items-center py-14 backdrop-blur-liminal">
        <div className="bg-breakthrough-50 rounded-full p-4 mb-5">
          <User className="h-14 w-14 text-breakthrough-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-3">
          Profile Missing
        </h2>
        <p className="text-secondary mb-6 text-center max-w-md">
          We couldn't find your profile information.
          <br />
          To unlock your personalized preferences, please complete the
          onboarding process.
        </p>
        <Link
          to="/onboarding"
          className="inline-block px-6 py-2 rounded-lg bg-breakthrough-500 text-primary font-semibold shadow-glow hover:bg-breakthrough-600 transition"
        >
          Start Onboarding
        </Link>
      </div>
    </div>
  );
};

export default Preferences;
