// Exercise Library for BodyGoal
// Categorized by type: strength training and cardio

export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
  category: string;
  muscleGroup: string[];
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number; // in minutes for cardio
}

export const STRENGTH_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', type: 'strength', category: 'Chest', muscleGroup: ['Chest', 'Triceps'], defaultSets: 4, defaultReps: 8 },
  { id: 'incline-bench', name: 'Incline Bench Press', type: 'strength', category: 'Chest', muscleGroup: ['Upper Chest', 'Triceps'], defaultSets: 4, defaultReps: 10 },
  { id: 'dumbbell-press', name: 'Dumbbell Press', type: 'strength', category: 'Chest', muscleGroup: ['Chest'], defaultSets: 4, defaultReps: 10 },
  { id: 'cable-fly', name: 'Cable Fly', type: 'strength', category: 'Chest', muscleGroup: ['Chest'], defaultSets: 3, defaultReps: 12 },
  { id: 'push-ups', name: 'Push-ups', type: 'strength', category: 'Chest', muscleGroup: ['Chest', 'Triceps'], defaultSets: 3, defaultReps: 15 },
  { id: 'dips-chest', name: 'Chest Dips', type: 'strength', category: 'Chest', muscleGroup: ['Chest', 'Triceps'], defaultSets: 3, defaultReps: 10 },

  // Back
  { id: 'deadlift', name: 'Deadlift', type: 'strength', category: 'Back', muscleGroup: ['Back', 'Hamstrings'], defaultSets: 4, defaultReps: 6 },
  { id: 'pull-ups', name: 'Pull-ups', type: 'strength', category: 'Back', muscleGroup: ['Back', 'Biceps'], defaultSets: 4, defaultReps: 8 },
  { id: 'barbell-row', name: 'Barbell Row', type: 'strength', category: 'Back', muscleGroup: ['Back'], defaultSets: 4, defaultReps: 10 },
  { id: 'lat-pulldown', name: 'Lat Pulldown', type: 'strength', category: 'Back', muscleGroup: ['Lats', 'Biceps'], defaultSets: 4, defaultReps: 10 },
  { id: 'cable-row', name: 'Cable Row', type: 'strength', category: 'Back', muscleGroup: ['Back'], defaultSets: 3, defaultReps: 12 },
  { id: 't-bar-row', name: 'T-Bar Row', type: 'strength', category: 'Back', muscleGroup: ['Back'], defaultSets: 3, defaultReps: 10 },
  { id: 'face-pulls', name: 'Face Pulls', type: 'strength', category: 'Back', muscleGroup: ['Rear Delts', 'Upper Back'], defaultSets: 3, defaultReps: 15 },

  // Legs
  { id: 'squat', name: 'Squat', type: 'strength', category: 'Legs', muscleGroup: ['Quads', 'Glutes'], defaultSets: 4, defaultReps: 8 },
  { id: 'leg-press', name: 'Leg Press', type: 'strength', category: 'Legs', muscleGroup: ['Quads', 'Glutes'], defaultSets: 4, defaultReps: 10 },
  { id: 'lunges', name: 'Lunges', type: 'strength', category: 'Legs', muscleGroup: ['Quads', 'Glutes'], defaultSets: 3, defaultReps: 12 },
  { id: 'leg-extension', name: 'Leg Extension', type: 'strength', category: 'Legs', muscleGroup: ['Quads'], defaultSets: 3, defaultReps: 12 },
  { id: 'leg-curl', name: 'Leg Curl', type: 'strength', category: 'Legs', muscleGroup: ['Hamstrings'], defaultSets: 3, defaultReps: 12 },
  { id: 'calf-raises', name: 'Calf Raises', type: 'strength', category: 'Legs', muscleGroup: ['Calves'], defaultSets: 4, defaultReps: 15 },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', type: 'strength', category: 'Legs', muscleGroup: ['Hamstrings', 'Glutes'], defaultSets: 3, defaultReps: 10 },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', type: 'strength', category: 'Shoulders', muscleGroup: ['Shoulders', 'Triceps'], defaultSets: 4, defaultReps: 8 },
  { id: 'lateral-raises', name: 'Lateral Raises', type: 'strength', category: 'Shoulders', muscleGroup: ['Side Delts'], defaultSets: 3, defaultReps: 12 },
  { id: 'front-raises', name: 'Front Raises', type: 'strength', category: 'Shoulders', muscleGroup: ['Front Delts'], defaultSets: 3, defaultReps: 12 },
  { id: 'arnold-press', name: 'Arnold Press', type: 'strength', category: 'Shoulders', muscleGroup: ['Shoulders'], defaultSets: 3, defaultReps: 10 },
  { id: 'reverse-fly', name: 'Reverse Fly', type: 'strength', category: 'Shoulders', muscleGroup: ['Rear Delts'], defaultSets: 3, defaultReps: 12 },
  { id: 'upright-row', name: 'Upright Row', type: 'strength', category: 'Shoulders', muscleGroup: ['Shoulders', 'Traps'], defaultSets: 3, defaultReps: 10 },

  // Arms
  { id: 'barbell-curl', name: 'Barbell Curl', type: 'strength', category: 'Arms', muscleGroup: ['Biceps'], defaultSets: 3, defaultReps: 10 },
  { id: 'hammer-curl', name: 'Hammer Curl', type: 'strength', category: 'Arms', muscleGroup: ['Biceps', 'Forearms'], defaultSets: 3, defaultReps: 12 },
  { id: 'tricep-extension', name: 'Tricep Extension', type: 'strength', category: 'Arms', muscleGroup: ['Triceps'], defaultSets: 3, defaultReps: 12 },
  { id: 'skull-crushers', name: 'Skull Crushers', type: 'strength', category: 'Arms', muscleGroup: ['Triceps'], defaultSets: 3, defaultReps: 10 },
  { id: 'preacher-curl', name: 'Preacher Curl', type: 'strength', category: 'Arms', muscleGroup: ['Biceps'], defaultSets: 3, defaultReps: 10 },
  { id: 'cable-curl', name: 'Cable Curl', type: 'strength', category: 'Arms', muscleGroup: ['Biceps'], defaultSets: 3, defaultReps: 12 },
  { id: 'tricep-dips', name: 'Tricep Dips', type: 'strength', category: 'Arms', muscleGroup: ['Triceps'], defaultSets: 3, defaultReps: 10 },

  // Core
  { id: 'plank', name: 'Plank', type: 'strength', category: 'Core', muscleGroup: ['Abs', 'Core'], defaultSets: 3, defaultReps: 60 },
  { id: 'russian-twists', name: 'Russian Twists', type: 'strength', category: 'Core', muscleGroup: ['Obliques'], defaultSets: 3, defaultReps: 20 },
  { id: 'crunches', name: 'Crunches', type: 'strength', category: 'Core', muscleGroup: ['Abs'], defaultSets: 3, defaultReps: 20 },
  { id: 'leg-raises', name: 'Leg Raises', type: 'strength', category: 'Core', muscleGroup: ['Lower Abs'], defaultSets: 3, defaultReps: 15 },
  { id: 'cable-crunches', name: 'Cable Crunches', type: 'strength', category: 'Core', muscleGroup: ['Abs'], defaultSets: 3, defaultReps: 15 },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', type: 'strength', category: 'Core', muscleGroup: ['Abs', 'Core'], defaultSets: 3, defaultReps: 10 },
];

export const CARDIO_EXERCISES: Exercise[] = [
  { id: 'running', name: 'Running', type: 'cardio', category: 'Cardio', muscleGroup: ['Legs', 'Cardio'], defaultDuration: 30 },
  { id: 'cycling', name: 'Cycling', type: 'cardio', category: 'Cardio', muscleGroup: ['Legs', 'Cardio'], defaultDuration: 45 },
  { id: 'rowing', name: 'Rowing Machine', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 20 },
  { id: 'elliptical', name: 'Elliptical', type: 'cardio', category: 'Cardio', muscleGroup: ['Legs', 'Cardio'], defaultDuration: 30 },
  { id: 'stairmaster', name: 'Stairmaster', type: 'cardio', category: 'Cardio', muscleGroup: ['Legs', 'Cardio'], defaultDuration: 20 },
  { id: 'jump-rope', name: 'Jump Rope', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 15 },
  { id: 'swimming', name: 'Swimming', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 30 },
  { id: 'hiit', name: 'HIIT Training', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 20 },
  { id: 'walking', name: 'Walking', type: 'cardio', category: 'Cardio', muscleGroup: ['Legs', 'Cardio'], defaultDuration: 45 },
  { id: 'battle-ropes', name: 'Battle Ropes', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 10 },
  { id: 'burpees', name: 'Burpees', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 10 },
  { id: 'mountain-climbers', name: 'Mountain Climbers', type: 'cardio', category: 'Cardio', muscleGroup: ['Full Body', 'Cardio'], defaultDuration: 10 },
];

export const ALL_EXERCISES = [...STRENGTH_EXERCISES, ...CARDIO_EXERCISES];

export const getExercisesByType = (type: 'strength' | 'cardio') => {
  return type === 'strength' ? STRENGTH_EXERCISES : CARDIO_EXERCISES;
};

export const getExerciseById = (id: string) => {
  return ALL_EXERCISES.find(ex => ex.id === id);
};

export const getExercisesByCategory = (category: string) => {
  return ALL_EXERCISES.filter(ex => ex.category === category);
};
