import { useState, useCallback } from 'react';
import { chatbotApi } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    name: string;
    result: any;
  };
}

interface UserContext {
  workouts?: any[];
  profile?: any;
  prs?: any[];
  nutritionEntries?: any[];
  scheduledWorkouts?: any[];
}

export function useChatbot(userContext?: UserContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message immediately
    const userMsgId = `msg-${Date.now()}-user`;
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history for context
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Prepare enriched user context with all fitness data
      const enrichedContext: any = {};

      // Add user profile data if available
      if (userContext?.profile) {
        enrichedContext.userProfile = {
          weight: userContext.profile.weight,
          height: userContext.profile.height,
          age: userContext.profile.age,
          gender: userContext.profile.gender,
          fitnessLevel: userContext.profile.fitnessLevel,
          goals: userContext.profile.goals,
        };
      }

      // Add workouts data with full details
      if (userContext?.workouts && userContext.workouts.length > 0) {
        enrichedContext.workouts = userContext.workouts.map(w => ({
          id: w.id,
          name: w.name,
          type: w.type,
          duration: w.duration,
          date: w.date?.toDate?.() || w.date,
          exercises: w.exercises.map((ex: any) => ({
            name: ex.name,
            category: ex.category,
            sets: ex.sets.map((set: any) => ({
              reps: set.reps,
              weight: set.weight,
              volume: set.reps * set.weight,
            })),
            totalVolume: ex.sets.reduce((sum: number, set: any) => sum + (set.reps * set.weight), 0),
            totalSets: ex.sets.length,
          })),
          totalVolume: w.exercises.reduce((total: number, ex: any) => 
            total + ex.sets.reduce((sum: number, set: any) => sum + (set.reps * set.weight), 0), 0
          ),
          totalSets: w.exercises.reduce((total: number, ex: any) => total + ex.sets.length, 0),
          notes: w.notes,
        }));
      }

      // Add PRs data
      if (userContext?.prs && userContext.prs.length > 0) {
        enrichedContext.personalRecords = userContext.prs.map(pr => ({
          exerciseName: pr.exerciseName,
          weight: pr.weight,
          reps: pr.reps,
          date: pr.date?.toDate?.() || pr.date,
          notes: pr.notes,
        }));
      }

      // Add nutrition data
      if (userContext?.nutritionEntries && userContext.nutritionEntries.length > 0) {
        enrichedContext.nutrition = userContext.nutritionEntries.map(entry => ({
          mealName: entry.mealName,
          mealType: entry.mealType,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fats: entry.fats,
          fiber: entry.fiber,
          date: entry.date?.toDate?.() || entry.date,
        }));
      }

      // Add scheduled workouts
      if (userContext?.scheduledWorkouts && userContext.scheduledWorkouts.length > 0) {
        enrichedContext.scheduledWorkouts = userContext.scheduledWorkouts.map(sw => ({
          templateName: sw.templateName,
          type: sw.type,
          date: sw.date?.toDate?.() || sw.date,
          exercises: sw.exercises,
          notes: sw.notes,
        }));
      }

      // Call API
      const response: any = await chatbotApi.sendMessage({
        message: userMessage,
        history,
        userContext: enrichedContext,
      });

      // Add assistant response
      const assistantMsgId = `msg-${Date.now()}-assistant`;
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        action: response.action,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      
      let errorMessage = 'Désolé, une erreur est survenue. Réessaye dans quelques instants.';
      
      if (err.message?.includes('unauthenticated')) {
        errorMessage = 'Tu dois être connecté pour utiliser le chatbot.';
      } else if (err.message?.includes('resource-exhausted')) {
        errorMessage = 'Trop de requêtes. Attends quelques secondes avant de réessayer.';
      }
      
      setError(errorMessage);
      
      // Add error message as assistant message
      const errorMsgId = `msg-${Date.now()}-error`;
      const errorMsg: ChatMessage = {
        id: errorMsgId,
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}