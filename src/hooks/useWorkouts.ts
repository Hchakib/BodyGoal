import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workoutsApi } from '../services/api';
import { WorkoutSession } from '../firebase/firestore';
import { convertDatesInArray } from '../utils/dateUtils';

export function useWorkouts(limitCount: number = 10) {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalDuration: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadWorkouts = useCallback(async () => {
    if (!currentUser) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response: any = await workoutsApi.getWorkouts(limitCount);
      
      // Convert date strings to Date objects
      const workoutsWithDates = convertDatesInArray<WorkoutSession>(
        response.workouts || [],
        ['date', 'createdAt']
      );
      setWorkouts(workoutsWithDates);
      
      const statsResponse: any = await workoutsApi.getStats();
      setStats(statsResponse.stats || { totalWorkouts: 0, totalDuration: 0, avgDuration: 0 });
    } catch (err) {
      setError(err);
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, limitCount]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const addWorkout = async (workoutData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await workoutsApi.createWorkout(workoutData);
      await loadWorkouts(); // Reload after adding
    } catch (err) {
      throw err;
    }
  };

  const updateWorkout = async (workoutId: string, data: Partial<WorkoutSession>) => {
    try {
      await workoutsApi.updateWorkout(workoutId, data);
      await loadWorkouts(); // Reload after updating
    } catch (err) {
      throw err;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      await workoutsApi.deleteWorkout(workoutId);
      await loadWorkouts(); // Reload after deleting
    } catch (err) {
      throw err;
    }
  };

  return {
    workouts,
    stats,
    loading,
    error,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    refresh: loadWorkouts
  };
}