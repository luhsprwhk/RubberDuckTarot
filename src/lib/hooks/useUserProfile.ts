import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { getUserProfile } from '../userPreferences';
import { type UserProfile } from '../../interfaces';

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfile(null);
        setHasProfile(false);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
        setHasProfile(!!userProfile);
      } catch (error) {
        console.error('Failed to check user profile:', error);
        setProfile(null);
        setHasProfile(false);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading]);

  const refreshProfile = async () => {
    if (!user) return;

    try {
      setProfileLoading(true);
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
      setHasProfile(!!userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  return {
    profile,
    hasProfile,
    loading: authLoading || profileLoading,
    refreshProfile,
  };
};
