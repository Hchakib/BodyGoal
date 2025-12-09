import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { templatesApi } from '../services/api';
import {
  WorkoutTemplate,
  WorkoutTemplateData,
  PRESET_TEMPLATES,
  TemplateFocus,
} from '../firebase/workoutTemplates';
import { toast } from 'sonner@2.0.3';
import { Timestamp } from 'firebase/firestore';
import { convertDatesInArray } from '../utils/dateUtils';

export function useWorkoutTemplates() {
  const { currentUser } = useAuth();
  const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response: any = await templatesApi.getTemplates();

        const normalized = (response.templates || []).map((t: any, idx: number) => {
          // Normalise le focus (évite un composant d'icône undefined)
          const allowedFocus = ['strength', 'hypertrophy', 'mixed', 'endurance'];
          const focus: TemplateFocus = allowedFocus.includes(t.focus)
            ? t.focus
            : (t.type === 'cardio' ? 'endurance' : 'mixed');

          // Fallbacks pour les templates venant du chatbot/back sans le même shape
          const workouts = Array.isArray(t.workouts) && t.workouts.length > 0
            ? t.workouts
            : [{
                dayNumber: 1,
                dayName: t.name || `Workout ${idx + 1}`,
                exercises: (t.exercises || []).map((ex: any, i: number) => ({
                  id: ex.id || `ex-${i}`,
                  name: ex.name,
                  sets: ex.sets || 3,
                  reps: typeof ex.reps === 'string' ? ex.reps : (ex.reps || 10).toString(),
                  notes: ex.notes || '',
                })),
              }];

          return {
            id: t.id,
            userId: t.userId,
            name: t.name,
            daysPerWeek: t.daysPerWeek || workouts.length || 1,
            focus,
            description: t.description || '',
            workouts,
            isPreset: !!t.isPreset,
            createdAt: t.createdAt,
          } as WorkoutTemplate;
        });

        const templatesWithDates = convertDatesInArray<WorkoutTemplate>(normalized, ['createdAt']);
        setUserTemplates(templatesWithDates);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentUser]);

  const addTemplate = async (data: WorkoutTemplateData) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const response: any = await templatesApi.createTemplate(data);
      
      // Add to local state
      const newTemplate: WorkoutTemplate = {
        id: response.id,
        userId: currentUser.uid,
        name: data.name,
        isPreset: false,
        createdAt: Timestamp.now(),
        daysPerWeek: data.daysPerWeek,
        focus: data.focus || 'mixed',
        description: data.description || '',
        workouts: data.workouts,
      };
      
      setUserTemplates([newTemplate, ...userTemplates]);
      toast.success('Template created successfully!');
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
      throw err;
    }
  };

  const removeTemplate = async (templateId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await templatesApi.deleteTemplate(templateId);
      setUserTemplates(userTemplates.filter(t => t.id !== templateId));
      toast.success('Template deleted');
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      throw err;
    }
  };

  // Combine preset and user templates with proper IDs
  const allTemplates: WorkoutTemplate[] = [
    ...PRESET_TEMPLATES.map((t, index) => ({
      ...t,
      id: `preset-${index}`,
      createdAt: Timestamp.now()
    })),
    ...userTemplates
  ];

  return {
    allTemplates,
    presetTemplates: PRESET_TEMPLATES.map((t, index) => ({
      ...t,
      id: `preset-${index}`,
      createdAt: Timestamp.now()
    })),
    userTemplates,
    loading,
    error,
    addTemplate,
    removeTemplate
  };
}
