export interface WorkoutSession {
  id?: string;
  userId: string;
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  date: any;
  createdAt: any;
}

export interface Exercise {
  name: string;
  sets: Set[];
  notes?: string;
  category?: string;
  totalVolume?: number;
}

export interface Set {
  reps: number;
  weight: number;
  completed?: boolean;
}
