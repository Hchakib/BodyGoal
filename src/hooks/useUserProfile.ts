import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authApi } from '../services/api';
import {
  UserProfile,
  createUserProfile
} from '../firebase/firestore';

export function useUserProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to real-time profile changes (keep Firebase for real-time)
  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Setup real-time listener
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            console.log('👤 User profile updated from Firestore:', data);
            if (data.nutritionGoals) {
              console.log('🍎 Nutrition goals detected:', data.nutritionGoals);
            }
            setProfile(data);
          } else {
            // Create profile if it doesn't exist
            await createUserProfile(currentUser.uid, {
              displayName: currentUser.displayName || 'Athlete',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined
            });
            // Profile will be updated via the listener
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to profile:', err);
        setError('Failed to listen to profile changes');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const loadProfile = useCallback(async () => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response: any = await authApi.getProfile();
      
      // Si le profil n'existe pas, le créer avec les données de base
      if (!response.profile) {
        await authApi.registerProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Athlete',
          photoURL: currentUser.photoURL || undefined
        });
        const newResponse: any = await authApi.getProfile();
        setProfile(newResponse.profile);
      } else {
        setProfile(response.profile);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await authApi.updateProfile(data);
      // onSnapshot will update automatically
    } catch (err) {
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: loadProfile
  };
}