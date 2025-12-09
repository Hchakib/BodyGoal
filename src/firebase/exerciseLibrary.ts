export interface ExerciseLibraryItem {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
  muscleGroup: string[];
  category: 'Compound' | 'Isolation' | 'Bodyweight' | 'Cardio' | 'Equipment';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Chest
  { id: 'ex-bench-press', name: 'Bench Press', type: 'strength', muscleGroup: ['Chest', 'Triceps'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', type: 'strength', muscleGroup: ['Chest', 'Shoulders'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-cable-flyes', name: 'Cable Flyes', type: 'strength', muscleGroup: ['Chest'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-dumbbell-press', name: 'Dumbbell Press', type: 'strength', muscleGroup: ['Chest'], category: 'Compound', difficulty: 'Beginner' },
  { id: 'ex-pushups', name: 'Push-ups', type: 'strength', muscleGroup: ['Chest', 'Triceps'], category: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex-decline-press', name: 'Decline Press', type: 'strength', muscleGroup: ['Chest'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-pec-deck', name: 'Pec Deck', type: 'strength', muscleGroup: ['Chest'], category: 'Isolation', difficulty: 'Beginner' },
  
  // Back
  { id: 'ex-deadlift', name: 'Deadlift', type: 'strength', muscleGroup: ['Back', 'Legs'], category: 'Compound', difficulty: 'Advanced' },
  { id: 'ex-pullups', name: 'Pull-ups', type: 'strength', muscleGroup: ['Back', 'Biceps'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-barbell-row', name: 'Barbell Row', type: 'strength', muscleGroup: ['Back'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-lat-pulldowns', name: 'Lat Pulldowns', type: 'strength', muscleGroup: ['Back'], category: 'Compound', difficulty: 'Beginner' },
  { id: 'ex-seated-cable-rows', name: 'Seated Cable Rows', type: 'strength', muscleGroup: ['Back'], category: 'Compound', difficulty: 'Beginner' },
  { id: 'ex-tbar-rows', name: 'T-Bar Rows', type: 'strength', muscleGroup: ['Back'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-face-pulls', name: 'Face Pulls', type: 'strength', muscleGroup: ['Back', 'Shoulders'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-single-arm-row', name: 'Single Arm Dumbbell Row', type: 'strength', muscleGroup: ['Back'], category: 'Compound', difficulty: 'Beginner' },
  
  // Legs
  { id: 'ex-back-squat', name: 'Back Squat', type: 'strength', muscleGroup: ['Legs', 'Glutes'], category: 'Compound', difficulty: 'Advanced' },
  { id: 'ex-front-squat', name: 'Front Squat', type: 'strength', muscleGroup: ['Legs'], category: 'Compound', difficulty: 'Advanced' },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift', type: 'strength', muscleGroup: ['Legs', 'Back'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-leg-press', name: 'Leg Press', type: 'strength', muscleGroup: ['Legs'], category: 'Compound', difficulty: 'Beginner' },
  { id: 'ex-leg-curls', name: 'Leg Curls', type: 'strength', muscleGroup: ['Hamstrings'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-leg-extensions', name: 'Leg Extensions', type: 'strength', muscleGroup: ['Quadriceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-calf-raises', name: 'Calf Raises', type: 'strength', muscleGroup: ['Calves'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-bulgarian-split-squats', name: 'Bulgarian Split Squats', type: 'strength', muscleGroup: ['Legs', 'Glutes'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-lunges', name: 'Lunges', type: 'strength', muscleGroup: ['Legs', 'Glutes'], category: 'Compound', difficulty: 'Beginner' },
  { id: 'ex-goblet-squat', name: 'Goblet Squat', type: 'strength', muscleGroup: ['Legs'], category: 'Compound', difficulty: 'Beginner' },
  
  // Shoulders
  { id: 'ex-overhead-press', name: 'Overhead Press', type: 'strength', muscleGroup: ['Shoulders'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-lateral-raises', name: 'Lateral Raises', type: 'strength', muscleGroup: ['Shoulders'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-front-raises', name: 'Front Raises', type: 'strength', muscleGroup: ['Shoulders'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-arnold-press', name: 'Arnold Press', type: 'strength', muscleGroup: ['Shoulders'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-shrugs', name: 'Shrugs', type: 'strength', muscleGroup: ['Traps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-rear-delt-flyes', name: 'Rear Delt Flyes', type: 'strength', muscleGroup: ['Shoulders'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-upright-row', name: 'Upright Row', type: 'strength', muscleGroup: ['Shoulders', 'Traps'], category: 'Compound', difficulty: 'Intermediate' },
  
  // Arms - Triceps
  { id: 'ex-tricep-pushdowns', name: 'Tricep Pushdowns', type: 'strength', muscleGroup: ['Triceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-tricep-extensions', name: 'Tricep Extensions', type: 'strength', muscleGroup: ['Triceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-skull-crushers', name: 'Skull Crushers', type: 'strength', muscleGroup: ['Triceps'], category: 'Isolation', difficulty: 'Intermediate' },
  { id: 'ex-close-grip-bench', name: 'Close Grip Bench Press', type: 'strength', muscleGroup: ['Triceps', 'Chest'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-dips', name: 'Dips', type: 'strength', muscleGroup: ['Triceps', 'Chest'], category: 'Compound', difficulty: 'Intermediate' },
  
  // Arms - Biceps
  { id: 'ex-bicep-curls', name: 'Bicep Curls', type: 'strength', muscleGroup: ['Biceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-hammer-curls', name: 'Hammer Curls', type: 'strength', muscleGroup: ['Biceps', 'Forearms'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-preacher-curls', name: 'Preacher Curls', type: 'strength', muscleGroup: ['Biceps'], category: 'Isolation', difficulty: 'Intermediate' },
  { id: 'ex-concentration-curls', name: 'Concentration Curls', type: 'strength', muscleGroup: ['Biceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-cable-curls', name: 'Cable Curls', type: 'strength', muscleGroup: ['Biceps'], category: 'Isolation', difficulty: 'Beginner' },
  { id: 'ex-chin-ups', name: 'Chin-ups', type: 'strength', muscleGroup: ['Biceps', 'Back'], category: 'Compound', difficulty: 'Intermediate' },
  
  // Core
  { id: 'ex-plank', name: 'Plank', type: 'strength', muscleGroup: ['Core'], category: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex-russian-twists', name: 'Russian Twists', type: 'strength', muscleGroup: ['Core'], category: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex-hanging-leg-raises', name: 'Hanging Leg Raises', type: 'strength', muscleGroup: ['Core'], category: 'Bodyweight', difficulty: 'Advanced' },
  { id: 'ex-ab-wheel-rollout', name: 'Ab Wheel Rollout', type: 'strength', muscleGroup: ['Core'], category: 'Equipment', difficulty: 'Advanced' },
  { id: 'ex-cable-crunches', name: 'Cable Crunches', type: 'strength', muscleGroup: ['Core'], category: 'Isolation', difficulty: 'Intermediate' },
  { id: 'ex-bicycle-crunches', name: 'Bicycle Crunches', type: 'strength', muscleGroup: ['Core'], category: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex-mountain-climbers', name: 'Mountain Climbers', type: 'strength', muscleGroup: ['Core', 'Cardio'], category: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex-side-plank', name: 'Side Plank', type: 'strength', muscleGroup: ['Core'], category: 'Bodyweight', difficulty: 'Intermediate' },
  
  // Cardio
  { id: 'ex-running', name: 'Running', type: 'cardio', muscleGroup: ['Cardio'], category: 'Cardio', difficulty: 'Beginner' },
  { id: 'ex-cycling', name: 'Cycling', type: 'cardio', muscleGroup: ['Cardio', 'Legs'], category: 'Cardio', difficulty: 'Beginner' },
  { id: 'ex-rowing', name: 'Rowing', type: 'cardio', muscleGroup: ['Cardio', 'Back'], category: 'Cardio', difficulty: 'Intermediate' },
  { id: 'ex-swimming', name: 'Swimming', type: 'cardio', muscleGroup: ['Cardio', 'Full Body'], category: 'Cardio', difficulty: 'Intermediate' },
  { id: 'ex-jump-rope', name: 'Jump Rope', type: 'cardio', muscleGroup: ['Cardio'], category: 'Cardio', difficulty: 'Beginner' },
  { id: 'ex-burpees', name: 'Burpees', type: 'cardio', muscleGroup: ['Cardio', 'Full Body'], category: 'Bodyweight', difficulty: 'Intermediate' },
  { id: 'ex-elliptical', name: 'Elliptical', type: 'cardio', muscleGroup: ['Cardio'], category: 'Cardio', difficulty: 'Beginner' },
  { id: 'ex-stair-climber', name: 'Stair Climber', type: 'cardio', muscleGroup: ['Cardio', 'Legs'], category: 'Cardio', difficulty: 'Intermediate' },
  { id: 'ex-boxing', name: 'Boxing', type: 'cardio', muscleGroup: ['Cardio', 'Arms'], category: 'Cardio', difficulty: 'Intermediate' },
  
  // Olympic Lifts
  { id: 'ex-clean-and-jerk', name: 'Clean and Jerk', type: 'strength', muscleGroup: ['Full Body'], category: 'Compound', difficulty: 'Advanced' },
  { id: 'ex-snatch', name: 'Snatch', type: 'strength', muscleGroup: ['Full Body'], category: 'Compound', difficulty: 'Advanced' },
  { id: 'ex-power-clean', name: 'Power Clean', type: 'strength', muscleGroup: ['Full Body'], category: 'Compound', difficulty: 'Advanced' },
  
  // Functional
  { id: 'ex-farmers-walk', name: 'Farmer\'s Walk', type: 'strength', muscleGroup: ['Full Body', 'Grip'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-sled-push', name: 'Sled Push', type: 'strength', muscleGroup: ['Legs', 'Cardio'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-battle-ropes', name: 'Battle Ropes', type: 'cardio', muscleGroup: ['Arms', 'Cardio'], category: 'Cardio', difficulty: 'Intermediate' },
  { id: 'ex-box-jumps', name: 'Box Jumps', type: 'strength', muscleGroup: ['Legs'], category: 'Bodyweight', difficulty: 'Intermediate' },
  { id: 'ex-kettlebell-swings', name: 'Kettlebell Swings', type: 'strength', muscleGroup: ['Full Body'], category: 'Compound', difficulty: 'Intermediate' },
  { id: 'ex-turkish-getup', name: 'Turkish Get-Up', type: 'strength', muscleGroup: ['Full Body'], category: 'Compound', difficulty: 'Advanced' },
];
