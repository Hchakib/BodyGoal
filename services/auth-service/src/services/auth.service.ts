import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coverPhoto?: string;
  bio?: string;
  age?: number;
  weight?: number;
  height?: number;
  fitnessGoal?: string;
  weeklyGoal?: number;
  nutritionGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt: any;
  updatedAt: any;
}

/**
 * Créer un nouveau profil utilisateur dans Firestore
 */
export const createUser = async (
  uid: string,
  userData: Partial<UserProfile>
): Promise<UserProfile> => {
  const userRef = db.collection('users').doc(uid);

  const userProfile: UserProfile = {
    uid,
    email: userData.email!,
    displayName: userData.displayName!,
    photoURL: userData.photoURL,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await userRef.set(userProfile);

  return userProfile;
};

/**
 * Récupérer un profil utilisateur
 */
export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as UserProfile;
};

/**
 * Mettre à jour un profil utilisateur
 */
export const updateUser = async (
  uid: string,
  updateData: Partial<UserProfile>
): Promise<UserProfile> => {
  const userRef = db.collection('users').doc(uid);

  await userRef.update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedDoc = await userRef.get();
  return updatedDoc.data() as UserProfile;
};

/**
 * Supprimer un profil utilisateur
 */
export const deleteUser = async (uid: string): Promise<void> => {
  await db.collection('users').doc(uid).delete();
};
