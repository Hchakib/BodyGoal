import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { prApi } from '../services/api';
import { PersonalRecord } from '../firebase/firestore';
import { convertDatesInArray } from '../utils/dateUtils';

export function usePersonalRecords() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!currentUser) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response: any = await prApi.getPRs();
      
      // Convert date strings to Date objects
      const recordsWithDates = convertDatesInArray<PersonalRecord>(
        response.prs || [],
        ['date', 'createdAt']
      );
      setRecords(recordsWithDates);
    } catch (err) {
      setError('Failed to load personal records');
      console.error('Error loading personal records:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const addRecord = async (recordData: Omit<PersonalRecord, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await prApi.createPR(recordData);
      await loadRecords(); // Reload after adding
    } catch (err) {
      throw err;
    }
  };

  const updateRecord = async (recordId: string, data: Partial<PersonalRecord>) => {
    try {
      await prApi.updatePR(recordId, data);
      await loadRecords(); // Reload after updating
    } catch (err) {
      throw err;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      await prApi.deletePR(recordId);
      await loadRecords(); // Reload after deleting
    } catch (err) {
      throw err;
    }
  };

  const getRecordsByExercise = async (exerciseName: string): Promise<PersonalRecord[]> => {
    if (!currentUser) return [];
    
    try {
      const response: any = await prApi.getPRs(exerciseName);
      return response.prs || [];
    } catch (err) {
      console.error('Error loading records by exercise:', err);
      return [];
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByExercise,
    refresh: loadRecords
  };
}