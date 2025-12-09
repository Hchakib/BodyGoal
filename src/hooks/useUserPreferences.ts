import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserPreferences,
  getUserPreferences,
  updateUserPreferences
} from '../firebase/firestore';

export function useUserPreferences() {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!currentUser) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserPreferences(currentUser.uid);
      setPreferences(data);
    } catch (err: any) {
      // If permissions error, set default preferences instead of crashing
      if (err?.code === 'permission-denied') {
        console.warn('⚠️ Permissions denied for user preferences, using defaults');
        setPreferences({
          userId: currentUser.uid,
          units: { weight: 'kg', distance: 'km', height: 'cm' },
          notifications: {
            workoutReminders: true,
            achievementAlerts: true,
            weeklyReports: false,
            prUpdates: true,
          },
          privacy: { profileVisibility: 'private', showStats: false },
          theme: 'dark'
        });
        setError(null); // Don't show error to user
      } else {
        setError('Failed to load preferences');
        console.error('Error loading preferences:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await updateUserPreferences(currentUser.uid, data);
      await loadPreferences(); // Reload after updating
    } catch (err) {
      throw err;
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refresh: loadPreferences
  };
}