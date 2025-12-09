import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { PersonalRecord } from '../types/pr.types';

/**
 * Créer un nouveau record personnel
 */
export const createPR = async (
  userId: string,
  prData: Omit<PersonalRecord, 'id' | 'userId' | 'createdAt'>
): Promise<{ id: string; pr: PersonalRecord }> => {
  const prRef = db.collection('personalRecords').doc();

  const pr: PersonalRecord = {
    ...prData,
    userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  await prRef.set(pr);

  return {
    id: prRef.id,
    pr: { ...pr, id: prRef.id },
  };
};

/**
 * Récupérer tous les PRs d'un utilisateur
 */
export const getPRs = async (userId: string): Promise<PersonalRecord[]> => {
  const prsRef = db
    .collection('personalRecords')
    .where('userId', '==', userId)
    .orderBy('date', 'desc');

  const snapshot = await prsRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as PersonalRecord));
};

/**
 * Récupérer les PRs par exercice
 */
export const getPRsByExercise = async (
  userId: string,
  exerciseName: string
): Promise<PersonalRecord[]> => {
  const prsRef = db
    .collection('personalRecords')
    .where('userId', '==', userId)
    .where('exerciseName', '==', exerciseName)
    .orderBy('date', 'desc');

  const snapshot = await prsRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as PersonalRecord));
};

/**
 * Récupérer un PR par ID
 */
export const getPRById = async (prId: string): Promise<PersonalRecord | null> => {
  const prRef = db.collection('personalRecords').doc(prId);
  const doc = await prRef.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as PersonalRecord;
};

/**
 * Mettre à jour un PR
 */
export const updatePR = async (
  prId: string,
  updateData: Partial<PersonalRecord>
): Promise<PersonalRecord> => {
  const prRef = db.collection('personalRecords').doc(prId);

  await prRef.update(updateData);

  const updatedDoc = await prRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as PersonalRecord;
};

/**
 * Supprimer un PR
 */
export const deletePR = async (prId: string): Promise<void> => {
  await db.collection('personalRecords').doc(prId).delete();
};
