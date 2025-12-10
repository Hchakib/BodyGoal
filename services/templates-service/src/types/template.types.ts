export interface WorkoutTemplate {
  id?: string;
  userId: string;
  name: string;
  type: string;
  description?: string;
  exercises: TemplateExercise[];
  createdAt: any;
  updatedAt: any;
}

export interface TemplateExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

export interface ScheduledWorkout {
  id?: string;
  userId: string;
  templateId?: string;
  templateName: string;
  type: string;
  date: any;
  completed: boolean;
  exercises: TemplateExercise[];
  notes?: string;
  createdAt: any;
}
