import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  updateDoc,
  doc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { WorkoutTemplate } from './workoutTemplates';

// Helper function to remove undefined fields from an object
const removeUndefinedFields = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Interface pour un exercice dans un workout planifié
export interface ScheduledExercise {
  name: string;
  type: 'strength' | 'cardio';
  muscleGroup: string[];
  category: string;
  // Pour strength exercises
  sets?: number;
  reps?: number;
  weight?: number;
  // Pour cardio exercises
  duration?: number;
}

export interface ScheduledWorkout {
  id: string;
  userId: string;
  date: Timestamp;
  templateId?: string; // ID du template utilisé
  templateName: string; // Nom de la séance
  type: 'strength' | 'cardio';
  exercises: ScheduledExercise[]; // Liste des exercices avec configurations
  completed: boolean;
  completedAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export interface ScheduledWorkoutData {
  date: Date;
  templateId?: string;
  templateName: string;
  type: 'strength' | 'cardio';
  exercises: ScheduledExercise[]; // Objets complets maintenant
  notes?: string;
}

// Créer une séance planifiée
export const createScheduledWorkout = async (
  userId: string,
  data: ScheduledWorkoutData
): Promise<string> => {
  try {
    console.log('🟢 createScheduledWorkout called');
    console.log('🟢 UserId:', userId);
    console.log('🟢 Data:', data);
    
    const scheduledRef = collection(db, 'users', userId, 'scheduledWorkouts');
    console.log('🟢 Collection ref created');
    
    // Clean exercises to remove undefined fields
    const cleanedExercises = data.exercises.map(ex => removeUndefinedFields(ex));
    
    // Build docData without undefined values
    const docData: any = {
      date: Timestamp.fromDate(data.date),
      templateName: data.templateName,
      type: data.type,
      exercises: cleanedExercises,
      completed: false,
      notes: data.notes || '',
      createdAt: Timestamp.now()
    };
    
    // Only add templateId if it exists
    if (data.templateId) {
      docData.templateId = data.templateId;
    }
    
    console.log('🟢 Document data:', docData);
    
    const docRef = await addDoc(scheduledRef, docData);
    console.log('🟢 Document created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('🔴 Error creating scheduled workout:', error);
    throw error;
  }
};

// Récupérer les séances planifiées d'un utilisateur
export const getScheduledWorkouts = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ScheduledWorkout[]> => {
  try {
    const scheduledRef = collection(db, 'users', userId, 'scheduledWorkouts');
    let q;

    if (startDate && endDate) {
      q = query(
        scheduledRef,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    } else {
      q = query(scheduledRef, orderBy('date', 'asc'));
    }

    const querySnapshot = await getDocs(q);
    const workouts: ScheduledWorkout[] = [];

    querySnapshot.forEach((doc) => {
      workouts.push({
        id: doc.id,
        userId,
        ...doc.data()
      } as ScheduledWorkout);
    });

    return workouts;
  } catch (error) {
    console.error('Error fetching scheduled workouts:', error);
    throw error;
  }
};

// Marquer une séance comme complétée
export const markWorkoutCompleted = async (
  userId: string,
  workoutId: string
): Promise<void> => {
  try {
    const workoutRef = doc(db, 'users', userId, 'scheduledWorkouts', workoutId);
    await updateDoc(workoutRef, {
      completed: true,
      completedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking workout completed:', error);
    throw error;
  }
};

// Supprimer une séance planifiée
export const deleteScheduledWorkout = async (
  userId: string,
  workoutId: string
): Promise<void> => {
  try {
    const workoutRef = doc(db, 'users', userId, 'scheduledWorkouts', workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    console.error('Error deleting scheduled workout:', error);
    throw error;
  }
};

// Mettre à jour une séance planifiée
export const updateScheduledWorkout = async (
  userId: string,
  workoutId: string,
  data: Partial<ScheduledWorkoutData>
): Promise<void> => {
  try {
    const workoutRef = doc(db, 'users', userId, 'scheduledWorkouts', workoutId);
    const updateData: any = {};
    
    if (data.date) updateData.date = Timestamp.fromDate(data.date);
    if (data.templateName) updateData.templateName = data.templateName;
    if (data.type) updateData.type = data.type;
    if (data.exercises) updateData.exercises = data.exercises;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    await updateDoc(workoutRef, updateData);
  } catch (error) {
    console.error('Error updating scheduled workout:', error);
    throw error;
  }
};

// Créer plusieurs séances à partir d'un template (pour une semaine complète)
export const scheduleTemplateWeek = async (
  userId: string,
  template: WorkoutTemplate,
  startDate: Date
): Promise<void> => {
  try {
    const promises = template.workouts.map((workout, index) => {
      const workoutDate = new Date(startDate);
      workoutDate.setDate(workoutDate.getDate() + index);
      
      // Convertir les exercices du template en ScheduledExercise
      const scheduledExercises: ScheduledExercise[] = workout.exercises.map(ex => {
        const isCardio = template.focus === 'endurance';
        
        return {
          name: ex.name,
          type: isCardio ? 'cardio' : 'strength',
          muscleGroup: [], // Peut être enrichi depuis exerciseLibrary si besoin
          category: 'Compound',
          sets: ex.sets,
          reps: parseInt(ex.reps) || 10, // Convertir string en number, défaut 10
          weight: 0
          // Ne pas inclure duration si undefined
        };
      });
      
      return createScheduledWorkout(userId, {
        date: workoutDate,
        templateId: template.id,
        templateName: `${template.name} - ${workout.dayName}`,
        type: template.focus === 'endurance' ? 'cardio' : 'strength',
        exercises: scheduledExercises,
        notes: `Day ${workout.dayNumber}: ${workout.dayName}`
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error scheduling template week:', error);
    throw error;
  }
};