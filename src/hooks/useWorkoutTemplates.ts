import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { templatesApi } from '../services/api';
import {
  WorkoutTemplate,
  WorkoutTemplateData,
  PRESET_TEMPLATES
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
        
        // Convert date strings to Date objects
        const templatesWithDates = convertDatesInArray<WorkoutTemplate>(
          response.templates || [],
          ['createdAt']
        );
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
        isPreset: false,
        createdAt: Timestamp.now(),
        ...data
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