import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Goal,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export function useGoals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    if (!currentUser) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getGoals(currentUser.uid);
      setGoals(data);
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await createGoal(currentUser.uid, goalData);
      await loadGoals(); // Reload after adding
    } catch (err) {
      throw err;
    }
  };

  const updateGoalData = async (goalId: string, data: Partial<Goal>) => {
    try {
      await updateGoal(goalId, data);
      await loadGoals(); // Reload after updating
    } catch (err) {
      throw err;
    }
  };

  const deleteGoalData = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      await loadGoals(); // Reload after deleting
    } catch (err) {
      throw err;
    }
  };

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal: updateGoalData,
    deleteGoal: deleteGoalData,
    refresh: loadGoals
  };
}
