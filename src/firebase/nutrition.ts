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

export interface NutritionEntry {
  id: string;
  mealName: string;
  calories: number;
  protein: number;      // Protéines en grammes
  carbs: number;        // Glucides en grammes
  fats: number;         // Lipides en grammes
  fiber?: number;       // Fibres en grammes (optionnel)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Timestamp;
  createdAt: Timestamp;
}

export interface NutritionData {
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date?: Date;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

// Créer une entrée nutritionnelle
export const createNutritionEntry = async (
  userId: string, 
  data: NutritionData
): Promise<string> => {
  try {
    const nutritionRef = collection(db, 'users', userId, 'nutrition');
    const entryDate = data.date || new Date();
    
    // Préparer les données en excluant les valeurs undefined
    const entryData: any = {
      mealName: data.mealName,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
      mealType: data.mealType,
      date: Timestamp.fromDate(entryDate),
      createdAt: Timestamp.now()
    };
    
    // Ajouter fiber seulement s'il est défini
    if (data.fiber !== undefined && data.fiber !== null) {
      entryData.fiber = data.fiber;
    }
    
    const docRef = await addDoc(nutritionRef, entryData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating nutrition entry:', error);
    throw error;
  }
};

// Récupérer les entrées nutritionnelles d'un utilisateur
export const getUserNutritionEntries = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<NutritionEntry[]> => {
  try {
    const nutritionRef = collection(db, 'users', userId, 'nutrition');
    let q;

    if (startDate && endDate) {
      q = query(
        nutritionRef,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
    } else {
      q = query(nutritionRef, orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const entries: NutritionEntry[] = [];

    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      } as NutritionEntry);
    });

    return entries;
  } catch (error) {
    console.error('Error fetching nutrition entries:', error);
    throw error;
  }
};

// Supprimer une entrée nutritionnelle
export const deleteNutritionEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  try {
    const entryRef = doc(db, 'users', userId, 'nutrition', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting nutrition entry:', error);
    throw error;
  }
};

// Calculer les statistiques nutritionnelles pour une période
export const getNutritionStats = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const entries = await getUserNutritionEntries(userId, startDate, endDate);
    
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    const averageCalories = entries.length > 0 ? totalCalories / entries.length : 0;
    
    // Grouper par type de repas
    const byMealType = entries.reduce((acc, entry) => {
      acc[entry.mealType] = (acc[entry.mealType] || 0) + entry.calories;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCalories,
      averageCalories,
      byMealType,
      entryCount: entries.length
    };
  } catch (error) {
    console.error('Error calculating nutrition stats:', error);
    throw error;
  }
};