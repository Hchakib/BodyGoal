import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { NutritionEntry, NutritionGoals } from '../types/nutrition.types';

/**
 * Créer une nouvelle entrée nutritionnelle
 */
export const createNutritionEntry = async (
  userId: string,
  entryData: Omit<NutritionEntry, 'id' | 'createdAt'>
): Promise<{ id: string; entry: NutritionEntry }> => {
  const entryRef = db.collection('users').doc(userId).collection('nutrition').doc();

  const entry: NutritionEntry = {
    ...entryData,
    // Forcer le champ date à être un Date/Timestamp Firestore
    date: entryData.date ? new Date(entryData.date as any) : new Date(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await entryRef.set(entry);

  return {
    id: entryRef.id,
    entry: { ...entry, id: entryRef.id },
  };
};

/**
 * Récupérer les entrées nutritionnelles d'un utilisateur
 */
export const getNutritionEntries = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<NutritionEntry[]> => {
  let query = db
    .collection('users')
    .doc(userId)
    .collection('nutrition')
    .orderBy('date', 'desc');

  if (startDate && endDate) {
    query = query
      .where('date', '>=', startDate)
      .where('date', '<=', endDate) as any;
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as NutritionEntry));
};

/**
 * Supprimer une entrée nutritionnelle
 */
export const deleteNutritionEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  await db
    .collection('users')
    .doc(userId)
    .collection('nutrition')
    .doc(entryId)
    .delete();
};

/**
 * Récupérer les objectifs nutritionnels
 */
export const getNutritionGoals = async (
  userId: string
): Promise<NutritionGoals | null> => {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  return data?.nutritionGoals || null;
};

/**
 * Mettre à jour les objectifs nutritionnels
 */
export const updateNutritionGoals = async (
  userId: string,
  goals: NutritionGoals
): Promise<NutritionGoals> => {
  await db.collection('users').doc(userId).update({
    nutritionGoals: goals,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return goals;
};

/**
 * Calculer les statistiques nutritionnelles
 */
export const getNutritionStats = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const entries = await getNutritionEntries(userId, startDate, endDate);

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalCarbs = entries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalFats = entries.reduce((sum, entry) => sum + entry.fats, 0);

  const avgCalories = entries.length > 0 ? Math.round(totalCalories / entries.length) : 0;

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    avgCalories,
    entryCount: entries.length,
  };
};
