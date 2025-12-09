import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { templatesApi } from '../services/api';
import {
  ScheduledWorkout,
  ScheduledWorkoutData
} from '../firebase/scheduledWorkouts';
import { WorkoutTemplate } from '../firebase/workoutTemplates';
import { toast } from 'sonner';
import { convertDatesInArray, toDate } from '../utils/dateUtils';

export function useScheduledWorkouts(startDate?: Date, endDate?: Date) {
  const { currentUser } = useAuth();
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  const fetchScheduledWorkouts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response: any = await templatesApi.getScheduledWorkouts();
      
      // Convert date strings to Date objects
      const workoutsWithDates = convertDatesInArray<ScheduledWorkout>(
        response.workouts || [],
        ['date', 'createdAt']
      );
      setScheduledWorkouts(workoutsWithDates);
      setError(null);
      setPermissionError(false);
    } catch (err: any) {
      console.error('Error fetching scheduled workouts:', err);
      
      // Check if it's a permission error
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setPermissionError(true);
        setError('Firestore permissions need to be updated');
      } else if (err?.message?.includes('index')) {
        setError('Firebase index is building. Please wait 1-2 minutes and refresh.');
      } else {
        setError('Failed to load scheduled workouts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledWorkouts();
  }, [currentUser, startDate, endDate]);

  const scheduleWorkout = async (data: ScheduledWorkoutData) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      console.log('🔵 scheduleWorkout called with data:', data);
      console.log('🔵 Current user ID:', currentUser.uid);
      
      await templatesApi.scheduleWorkout(data);
      console.log('✅ Workout created successfully');
      
      await fetchScheduledWorkouts();
      console.log('✅ Workouts refreshed');
      
      toast.success('Workout scheduled! 📅');
    } catch (err) {
      console.error('❌ Error scheduling workout:', err);
      toast.error('Failed to schedule workout');
      throw err;
    }
  };

  const scheduleTemplate = async (template: WorkoutTemplate, startDate: Date) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      // Schedule multiple workouts for the week based on template
      await templatesApi.scheduleWorkout({
        templateId: template.id,
        date: startDate,
        completed: false,
        notes: `Week schedule for ${template.name}`
      });
      await fetchScheduledWorkouts();
      toast.success(`${template.name} scheduled for the week! 🎯`);
    } catch (err) {
      console.error('Error scheduling template:', err);
      toast.error('Failed to schedule template');
      throw err;
    }
  };

  const removeScheduledWorkout = async (workoutId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await templatesApi.deleteScheduledWorkout(workoutId);
      setScheduledWorkouts(scheduledWorkouts.filter(w => w.id !== workoutId));
      toast.success('Scheduled workout removed');
    } catch (err) {
      console.error('Error removing scheduled workout:', err);
      toast.error('Failed to remove scheduled workout');
      throw err;
    }
  };

  const completeScheduledWorkout = async (workoutId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await templatesApi.completeWorkout(workoutId);
      await fetchScheduledWorkouts();
      toast.success('Workout marked as completed! ✅');
    } catch (err) {
      console.error('Error marking workout completed:', err);
      toast.error('Failed to mark workout completed');
      throw err;
    }
  };

  const updateWorkout = async (workoutId: string, data: Partial<ScheduledWorkoutData>) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await templatesApi.scheduleWorkout({ ...data, id: workoutId } as any);
      await fetchScheduledWorkouts();
      toast.success('Workout updated');
    } catch (err) {
      console.error('Error updating workout:', err);
      toast.error('Failed to update workout');
      throw err;
    }
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = (date: Date) => {
    return scheduledWorkouts.filter(workout => {
      const workoutDate = toDate(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  return {
    scheduledWorkouts,
    loading,
    error,
    permissionError,
    scheduleWorkout,
    scheduleTemplate,
    removeScheduledWorkout,
    completeScheduledWorkout,
    updateWorkout,
    getWorkoutsForDate,
    refreshScheduledWorkouts: fetchScheduledWorkouts
  };
}