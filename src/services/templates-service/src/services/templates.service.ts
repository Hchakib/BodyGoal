import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { WorkoutTemplate, ScheduledWorkout } from '../types/template.types';

/**
 * Créer un nouveau template
 */
export const createTemplate = async (
  userId: string,
  templateData: Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ id: string; template: WorkoutTemplate }> => {
  const templateRef = db.collection('workoutTemplates').doc();

  const template: WorkoutTemplate = {
    ...templateData,
    userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await templateRef.set(template);

  return {
    id: templateRef.id,
    template: { ...template, id: templateRef.id },
  };
};

/**
 * Récupérer tous les templates d'un utilisateur
 */
export const getTemplates = async (userId: string): Promise<WorkoutTemplate[]> => {
  const templatesRef = db
    .collection('workoutTemplates')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc');

  const snapshot = await templatesRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WorkoutTemplate));
};

/**
 * Récupérer un template par ID
 */
export const getTemplateById = async (
  templateId: string
): Promise<WorkoutTemplate | null> => {
  const templateRef = db.collection('workoutTemplates').doc(templateId);
  const doc = await templateRef.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as WorkoutTemplate;
};

/**
 * Mettre à jour un template
 */
export const updateTemplate = async (
  templateId: string,
  updateData: Partial<WorkoutTemplate>
): Promise<WorkoutTemplate> => {
  const templateRef = db.collection('workoutTemplates').doc(templateId);

  await templateRef.update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedDoc = await templateRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as WorkoutTemplate;
};

/**
 * Supprimer un template
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  await db.collection('workoutTemplates').doc(templateId).delete();
};

/**
 * Créer un workout planifié
 */
export const scheduleWorkout = async (
  userId: string,
  workoutData: Omit<ScheduledWorkout, 'id' | 'userId' | 'createdAt'>
): Promise<{ id: string; workout: ScheduledWorkout }> => {
  const workoutRef = db.collection('scheduledWorkouts').doc();

  const workout: ScheduledWorkout = {
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
 * Récupérer les workouts planifiés
 */
export const getScheduledWorkouts = async (
  userId: string
): Promise<ScheduledWorkout[]> => {
  const workoutsRef = db
    .collection('scheduledWorkouts')
    .where('userId', '==', userId)
    .orderBy('date', 'asc');

  const snapshot = await workoutsRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as ScheduledWorkout));
};

/**
 * Marquer un workout planifié comme complété
 */
export const completeScheduledWorkout = async (
  workoutId: string
): Promise<ScheduledWorkout> => {
  const workoutRef = db.collection('scheduledWorkouts').doc(workoutId);

  await workoutRef.update({
    completed: true,
  });

  const updatedDoc = await workoutRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as ScheduledWorkout;
};

/**
 * Supprimer un workout planifié
 */
export const deleteScheduledWorkout = async (workoutId: string): Promise<void> => {
  await db.collection('scheduledWorkouts').doc(workoutId).delete();
};
