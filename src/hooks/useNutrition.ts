import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { nutritionApi } from '../services/api';
import { NutritionEntry, NutritionData } from '../firebase/nutrition';
import { toast } from 'sonner';
import { convertDatesInArray, toDate } from '../utils/dateUtils';

export function useNutrition(days: number = 7) {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const response: any = await nutritionApi.getMeals(startDate.toISOString(), endDate.toISOString());
        
        // Convert date strings to Date objects
        const entriesWithDates = convertDatesInArray<NutritionEntry>(
          response.meals || [],
          ['date', 'createdAt']
        );
        setEntries(entriesWithDates);
        setError(null);
      } catch (err) {
        console.error('Error fetching nutrition entries:', err);
        setError('Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [currentUser, days]);

  const addEntry = async (data: NutritionData) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await nutritionApi.addMeal(data);
      
      // Refresh entries
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const response: any = await nutritionApi.getMeals(startDate.toISOString(), endDate.toISOString());
      
      // Convert date strings to Date objects
      const entriesWithDates = convertDatesInArray<NutritionEntry>(
        response.meals || [],
        ['date', 'createdAt']
      );
      setEntries(entriesWithDates);
      
      toast.success('Meal logged successfully!');
    } catch (err) {
      console.error('Error adding nutrition entry:', err);
      toast.error('Failed to log meal');
      throw err;
    }
  };

  const removeEntry = async (entryId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await nutritionApi.deleteMeal(entryId);
      setEntries(entries.filter(entry => entry.id !== entryId));
      toast.success('Entry deleted');
    } catch (err) {
      console.error('Error deleting nutrition entry:', err);
      toast.error('Failed to delete entry');
      throw err;
    }
  };

  // Calculate today's calories
  const todayCalories = entries
    .filter(entry => {
      const entryDate = toDate(entry.date);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    })
    .reduce((sum, entry) => sum + entry.calories, 0);

  // Calculate today's macros
  const todayMacros = entries
    .filter(entry => {
      const entryDate = toDate(entry.date);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    })
    .reduce((acc, entry) => ({
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fats: acc.fats + (entry.fats || 0),
      fiber: acc.fiber + (entry.fiber || 0)
    }), { protein: 0, carbs: 0, fats: 0, fiber: 0 });

  // Calculate yesterday's calories
  const yesterdayCalories = entries
    .filter(entry => {
      const entryDate = toDate(entry.date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return entryDate.toDateString() === yesterday.toDateString();
    })
    .reduce((sum, entry) => sum + entry.calories, 0);

  // Get daily calories for the last 7 days
  const dailyCalories = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    const dayEntries = entries.filter(entry => {
      const entryDate = toDate(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });

    const totalCalories = dayEntries.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = dayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const totalCarbs = dayEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
    const totalFats = dayEntries.reduce((sum, entry) => sum + (entry.fats || 0), 0);

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
      fullDate: date
    };
  });

  // Get today's entries
  const todayEntries = entries.filter(entry => {
    const entryDate = toDate(entry.date);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }).sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());

  return {
    entries,
    todayEntries,
    todayCalories,
    todayMacros,
    yesterdayCalories,
    dailyCalories,
    loading,
    error,
    addEntry,
    removeEntry
  };
}
