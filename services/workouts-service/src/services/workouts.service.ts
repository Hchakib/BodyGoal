import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { WorkoutSession } from '../types/workout.types';

/**
 * Créer une nouvelle session d'entraînement
 */
export const createWorkout = async (
  userId: string,
  workoutData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>
): Promise<{ id: string; workout: WorkoutSession }> => {
  const workoutRef = db.collection('workoutSessions').doc();

  const workout: WorkoutSession = {
    ...workoutData,
    userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  await workoutRef.set(workout);

  return {
    id: workoutRef.id,
    workout: { ...workout, id: workoutRef.id },
  };
};

/**
 * Récupérer les sessions d'entraînement d'un utilisateur
 */
export const getWorkouts = async (
  userId: string,
  limit: number = 10
): Promise<WorkoutSession[]> => {
  const workoutsRef = db
    .collection('workoutSessions')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .limit(limit);

  const snapshot = await workoutsRef.get();
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WorkoutSession));
};

/**
 * Récupérer une session d'entraînement par ID
 */
export const getWorkoutById = async (
  workoutId: string
): Promise<WorkoutSession | null> => {
  const workoutRef = db.collection('workoutSessions').doc(workoutId);
  const doc = await workoutRef.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as WorkoutSession;
};

/**
 * Mettre à jour une session d'entraînement
 */
export const updateWorkout = async (
  workoutId: string,
  updateData: Partial<WorkoutSession>
): Promise<WorkoutSession> => {
  const workoutRef = db.collection('workoutSessions').doc(workoutId);

  await workoutRef.update(updateData);

  const updatedDoc = await workoutRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as WorkoutSession;
};

/**
 * Supprimer une session d'entraînement
 */
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  await db.collection('workoutSessions').doc(workoutId).delete();
};

/**
 * Obtenir les statistiques des workouts
 */
export const getWorkoutStats = async (userId: string) => {
  const workouts = await getWorkouts(userId, 100);
  
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((acc, w) => acc + w.duration, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  return {
    totalWorkouts,
    totalDuration,
    avgDuration,
  };
};
