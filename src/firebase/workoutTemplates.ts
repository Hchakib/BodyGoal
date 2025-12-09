import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export type TemplateFocus = 'strength' | 'hypertrophy' | 'mixed' | 'endurance';

export interface TemplateExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-12" or "5"
  notes?: string;
}

export interface TemplateDayWorkout {
  dayNumber: number;
  dayName: string; // e.g. "Push", "Pull", "Legs"
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  daysPerWeek: number;
  focus: TemplateFocus;
  description?: string;
  workouts: TemplateDayWorkout[];
  isPreset: boolean; // true for built-in, false for user-created
  userId?: string; // only for user templates
  createdAt: Timestamp;
}

export interface WorkoutTemplateData {
  name: string;
  daysPerWeek: number;
  focus: TemplateFocus;
  description?: string;
  workouts: TemplateDayWorkout[];
}

// Créer un template personnalisé
export const createWorkoutTemplate = async (
  userId: string,
  data: WorkoutTemplateData
): Promise<string> => {
  try {
    const templatesRef = collection(db, 'users', userId, 'workoutTemplates');
    
    const docRef = await addDoc(templatesRef, {
      name: data.name,
      daysPerWeek: data.daysPerWeek,
      focus: data.focus,
      description: data.description || '',
      workouts: data.workouts,
      isPreset: false,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating workout template:', error);
    throw error;
  }
};

// Récupérer les templates de l'utilisateur
export const getUserWorkoutTemplates = async (
  userId: string
): Promise<WorkoutTemplate[]> => {
  try {
    const templatesRef = collection(db, 'users', userId, 'workoutTemplates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const templates: WorkoutTemplate[] = [];

    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        userId,
        isPreset: false,
        ...doc.data()
      } as WorkoutTemplate);
    });

    return templates;
  } catch (error) {
    console.error('Error fetching user templates:', error);
    throw error;
  }
};

// Supprimer un template
export const deleteWorkoutTemplate = async (
  userId: string,
  templateId: string
): Promise<void> => {
  try {
    const templateRef = doc(db, 'users', userId, 'workoutTemplates', templateId);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Templates prédéfinis
export const PRESET_TEMPLATES: Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt'>[] = [
  {
    name: 'PPL Advanced',
    daysPerWeek: 6,
    focus: 'hypertrophy',
    description: 'Push/Pull/Legs split for advanced lifters, 6 days per week',
    isPreset: true,
    workouts: [
      {
        dayNumber: 1,
        dayName: 'Push A',
        exercises: [
          { id: 'bench-press', name: 'Bench Press', sets: 4, reps: '6-8' },
          { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 4, reps: '8-10' },
          { id: 'ohp', name: 'Overhead Press', sets: 3, reps: '8-10' },
          { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, reps: '12-15' },
          { id: 'tricep-ext', name: 'Tricep Extension', sets: 3, reps: '10-12' }
        ]
      },
      {
        dayNumber: 2,
        dayName: 'Pull A',
        exercises: [
          { id: 'deadlift', name: 'Deadlift', sets: 4, reps: '5-6' },
          { id: 'pull-ups', name: 'Pull-ups', sets: 4, reps: '8-10' },
          { id: 'bb-row', name: 'Barbell Row', sets: 4, reps: '8-10' },
          { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: '15-20' },
          { id: 'bb-curl', name: 'Barbell Curl', sets: 3, reps: '10-12' }
        ]
      },
      {
        dayNumber: 3,
        dayName: 'Legs A',
        exercises: [
          { id: 'squat', name: 'Squat', sets: 4, reps: '6-8' },
          { id: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '8-10' },
          { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '10-12' },
          { id: 'leg-curl', name: 'Leg Curl', sets: 3, reps: '12-15' },
          { id: 'calf-raise', name: 'Calf Raise', sets: 4, reps: '15-20' }
        ]
      },
      {
        dayNumber: 4,
        dayName: 'Push B',
        exercises: [
          { id: 'incline-bb', name: 'Incline Bench Press', sets: 4, reps: '8-10' },
          { id: 'db-press', name: 'Dumbbell Press', sets: 4, reps: '10-12' },
          { id: 'db-ohp', name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12' },
          { id: 'cable-fly', name: 'Cable Fly', sets: 3, reps: '12-15' },
          { id: 'tricep-dips', name: 'Tricep Dips', sets: 3, reps: '10-12' }
        ]
      },
      {
        dayNumber: 5,
        dayName: 'Pull B',
        exercises: [
          { id: 'lat-pulldown', name: 'Lat Pulldown', sets: 4, reps: '8-10' },
          { id: 't-bar-row', name: 'T-Bar Row', sets: 4, reps: '8-10' },
          { id: 'seated-row', name: 'Seated Cable Row', sets: 4, reps: '10-12' },
          { id: 'rear-delt-fly', name: 'Rear Delt Fly', sets: 3, reps: '12-15' },
          { id: 'hammer-curl', name: 'Hammer Curl', sets: 3, reps: '10-12' }
        ]
      },
      {
        dayNumber: 6,
        dayName: 'Legs B',
        exercises: [
          { id: 'front-squat', name: 'Front Squat', sets: 4, reps: '8-10' },
          { id: 'lunges', name: 'Bulgarian Split Squat', sets: 3, reps: '10-12' },
          { id: 'leg-ext', name: 'Leg Extension', sets: 3, reps: '12-15' },
          { id: 'hamstring-curl', name: 'Hamstring Curl', sets: 3, reps: '12-15' },
          { id: 'seated-calf', name: 'Seated Calf Raise', sets: 4, reps: '15-20' }
        ]
      }
    ]
  },
  {
    name: 'Full Body Strength',
    daysPerWeek: 3,
    focus: 'strength',
    description: 'Full body routine focusing on compound movements, 3 days per week',
    isPreset: true,
    workouts: [
      {
        dayNumber: 1,
        dayName: 'Day A',
        exercises: [
          { id: 'squat', name: 'Squat', sets: 5, reps: '5' },
          { id: 'bench-press', name: 'Bench Press', sets: 5, reps: '5' },
          { id: 'bb-row', name: 'Barbell Row', sets: 4, reps: '8' },
          { id: 'ohp', name: 'Overhead Press', sets: 3, reps: '8' },
          { id: 'plank', name: 'Plank', sets: 3, reps: '60s' }
        ]
      },
      {
        dayNumber: 2,
        dayName: 'Day B',
        exercises: [
          { id: 'deadlift', name: 'Deadlift', sets: 5, reps: '5' },
          { id: 'ohp', name: 'Overhead Press', sets: 5, reps: '5' },
          { id: 'pull-ups', name: 'Pull-ups', sets: 4, reps: '8' },
          { id: 'db-press', name: 'Dumbbell Press', sets: 3, reps: '10' },
          { id: 'ab-wheel', name: 'Ab Wheel', sets: 3, reps: '12' }
        ]
      },
      {
        dayNumber: 3,
        dayName: 'Day C',
        exercises: [
          { id: 'front-squat', name: 'Front Squat', sets: 4, reps: '6' },
          { id: 'incline-bb', name: 'Incline Bench Press', sets: 4, reps: '6' },
          { id: 't-bar-row', name: 'T-Bar Row', sets: 4, reps: '8' },
          { id: 'db-ohp', name: 'Dumbbell Shoulder Press', sets: 3, reps: '10' },
          { id: 'hanging-leg', name: 'Hanging Leg Raise', sets: 3, reps: '12' }
        ]
      }
    ]
  },
  {
    name: 'Beginner 3 Days',
    daysPerWeek: 3,
    focus: 'mixed',
    description: 'Simple full body routine for beginners, 3 days per week',
    isPreset: true,
    workouts: [
      {
        dayNumber: 1,
        dayName: 'Day 1',
        exercises: [
          { id: 'squat', name: 'Goblet Squat', sets: 3, reps: '10-12' },
          { id: 'push-ups', name: 'Push-ups', sets: 3, reps: '8-12' },
          { id: 'db-row', name: 'Dumbbell Row', sets: 3, reps: '10-12' },
          { id: 'plank', name: 'Plank', sets: 3, reps: '30-45s' }
        ]
      },
      {
        dayNumber: 2,
        dayName: 'Day 2',
        exercises: [
          { id: 'lunges', name: 'Lunges', sets: 3, reps: '10-12' },
          { id: 'db-press', name: 'Dumbbell Press', sets: 3, reps: '10-12' },
          { id: 'lat-pulldown', name: 'Lat Pulldown', sets: 3, reps: '10-12' },
          { id: 'crunches', name: 'Crunches', sets: 3, reps: '15-20' }
        ]
      },
      {
        dayNumber: 3,
        dayName: 'Day 3',
        exercises: [
          { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '10-12' },
          { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
          { id: 'seated-row', name: 'Seated Cable Row', sets: 3, reps: '10-12' },
          { id: 'russian-twist', name: 'Russian Twist', sets: 3, reps: '20' }
        ]
      }
    ]
  },
  {
    name: 'Powerbuilding',
    daysPerWeek: 4,
    focus: 'strength',
    description: 'Combination of powerlifting and bodybuilding, 4 days per week',
    isPreset: true,
    workouts: [
      {
        dayNumber: 1,
        dayName: 'Upper Power',
        exercises: [
          { id: 'bench-press', name: 'Bench Press', sets: 5, reps: '3-5' },
          { id: 'bb-row', name: 'Barbell Row', sets: 5, reps: '3-5' },
          { id: 'ohp', name: 'Overhead Press', sets: 4, reps: '6-8' },
          { id: 'pull-ups', name: 'Weighted Pull-ups', sets: 4, reps: '6-8' }
        ]
      },
      {
        dayNumber: 2,
        dayName: 'Lower Power',
        exercises: [
          { id: 'squat', name: 'Squat', sets: 5, reps: '3-5' },
          { id: 'deadlift', name: 'Deadlift', sets: 5, reps: '3-5' },
          { id: 'front-squat', name: 'Front Squat', sets: 3, reps: '6-8' },
          { id: 'leg-curl', name: 'Leg Curl', sets: 3, reps: '8-10' }
        ]
      },
      {
        dayNumber: 3,
        dayName: 'Upper Hypertrophy',
        exercises: [
          { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 4, reps: '10-12' },
          { id: 'seated-row', name: 'Seated Cable Row', sets: 4, reps: '10-12' },
          { id: 'lateral-raise', name: 'Lateral Raise', sets: 4, reps: '12-15' },
          { id: 'cable-fly', name: 'Cable Fly', sets: 3, reps: '12-15' },
          { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: '15-20' }
        ]
      },
      {
        dayNumber: 4,
        dayName: 'Lower Hypertrophy',
        exercises: [
          { id: 'leg-press', name: 'Leg Press', sets: 4, reps: '10-12' },
          { id: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '10-12' },
          { id: 'lunges', name: 'Walking Lunges', sets: 3, reps: '12-15' },
          { id: 'leg-ext', name: 'Leg Extension', sets: 3, reps: '12-15' },
          { id: 'calf-raise', name: 'Calf Raise', sets: 4, reps: '15-20' }
        ]
      }
    ]
  },
  {
    name: 'Hypertrophy Split',
    daysPerWeek: 5,
    focus: 'hypertrophy',
    description: 'Classic bodybuilding split for muscle growth, 5 days per week',
    isPreset: true,
    workouts: [
      {
        dayNumber: 1,
        dayName: 'Chest',
        exercises: [
          { id: 'bench-press', name: 'Bench Press', sets: 4, reps: '8-10' },
          { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 4, reps: '10-12' },
          { id: 'cable-fly', name: 'Cable Fly', sets: 3, reps: '12-15' },
          { id: 'dips', name: 'Chest Dips', sets: 3, reps: '10-12' },
          { id: 'push-ups', name: 'Push-ups', sets: 3, reps: 'to failure' }
        ]
      },
      {
        dayNumber: 2,
        dayName: 'Back',
        exercises: [
          { id: 'deadlift', name: 'Deadlift', sets: 4, reps: '6-8' },
          { id: 'pull-ups', name: 'Pull-ups', sets: 4, reps: '8-10' },
          { id: 't-bar-row', name: 'T-Bar Row', sets: 4, reps: '10-12' },
          { id: 'lat-pulldown', name: 'Lat Pulldown', sets: 3, reps: '12-15' },
          { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: '15-20' }
        ]
      },
      {
        dayNumber: 3,
        dayName: 'Shoulders',
        exercises: [
          { id: 'ohp', name: 'Overhead Press', sets: 4, reps: '8-10' },
          { id: 'lateral-raise', name: 'Lateral Raise', sets: 4, reps: '12-15' },
          { id: 'front-raise', name: 'Front Raise', sets: 3, reps: '12-15' },
          { id: 'rear-delt-fly', name: 'Rear Delt Fly', sets: 3, reps: '12-15' },
          { id: 'shrugs', name: 'Shrugs', sets: 3, reps: '15-20' }
        ]
      },
      {
        dayNumber: 4,
        dayName: 'Arms',
        exercises: [
          { id: 'bb-curl', name: 'Barbell Curl', sets: 4, reps: '10-12' },
          { id: 'tricep-ext', name: 'Tricep Extension', sets: 4, reps: '10-12' },
          { id: 'hammer-curl', name: 'Hammer Curl', sets: 3, reps: '12-15' },
          { id: 'skull-crushers', name: 'Skull Crushers', sets: 3, reps: '12-15' },
          { id: 'cable-curl', name: 'Cable Curl', sets: 3, reps: '15-20' }
        ]
      },
      {
        dayNumber: 5,
        dayName: 'Legs',
        exercises: [
          { id: 'squat', name: 'Squat', sets: 4, reps: '8-10' },
          { id: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '10-12' },
          { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '12-15' },
          { id: 'leg-curl', name: 'Leg Curl', sets: 3, reps: '12-15' },
          { id: 'calf-raise', name: 'Calf Raise', sets: 4, reps: '15-20' }
        ]
      }
    ]
  }
];
