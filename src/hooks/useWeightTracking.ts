import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  WeightEntry,
  getWeightEntries,
  createWeightEntry,
  deleteWeightEntry
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export function useWeightTracking() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!currentUser) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getWeightEntries(currentUser.uid, 30);
      setEntries(data);
    } catch (err) {
      setError('Failed to load weight entries');
      console.error('Error loading weight entries:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = async (weight: number, date?: Date, notes?: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await createWeightEntry(currentUser.uid, {
        weight,
        date: date ? Timestamp.fromDate(date) : Timestamp.now(),
        notes
      });
      await loadEntries(); // Reload after adding
    } catch (err) {
      throw err;
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      await deleteWeightEntry(entryId);
      await loadEntries(); // Reload after deleting
    } catch (err) {
      throw err;
    }
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    refresh: loadEntries
  };
}
