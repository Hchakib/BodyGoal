import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Helper function to log Firestore errors with index links
function logFirestoreError(context: string, error: any) {
  console.error(`%c🔥 FIRESTORE ERROR - ${context}`, 'color: #ff4444; font-weight: bold; font-size: 14px;');
  
  if (error?.code === 'failed-precondition' && error?.message) {
    console.error('%c⚠️ INDEX REQUIRED!', 'color: #ffaa00; font-weight: bold; font-size: 16px; background: #000; padding: 8px;');
    
    // Extract the index creation link
    const linkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
    if (linkMatch) {
      const indexLink = linkMatch[0];
      console.error('%c📋 CLICK THIS LINK TO CREATE THE INDEX:', 'color: #22C55E; font-weight: bold; font-size: 14px;');
      console.error('%c' + indexLink, 'color: #00D1FF; font-size: 12px; text-decoration: underline;');
      console.error('%c\n✅ Steps:\n1. Click the link above\n2. Click "Create Index" in Firebase Console\n3. Wait 2-5 minutes\n4. Refresh the page', 'color: #22C55E; font-size: 12px;');
    }
    
    console.error('%cFull error details:', 'color: #999; font-size: 11px;');
    console.error(error);
  } else {
    console.error('Error details:', error);
  }
  
  console.error('─'.repeat(80));
}

// Types pour les documents Firestore
export interface WorkoutSession {
  id?: string;
  userId: string;
  name: string;
  type: string;
  duration: number; // en minutes
  exercises: Exercise[];
  notes?: string;
  date: Timestamp;
  createdAt: any;
}

export interface Exercise {
  name: string;
  sets: Set[];
  notes?: string;
}

export interface Set {
  reps: number;
  weight: number; // en kg
  completed?: boolean; // Rendre optionnel
}

export interface PersonalRecord {
  id?: string;
  userId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Timestamp;
  createdAt: any;
}

// Fonctions pour les sessions d'entraînement
export const createWorkoutSession = async (
  userId: string,
  sessionData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>
): Promise<string> => {
  try {
    const sessionRef = doc(collection(db, 'workoutSessions'));
    const session: WorkoutSession = {
      ...sessionData,
      userId,
      createdAt: serverTimestamp()
    };
    await setDoc(sessionRef, session);
    return sessionRef.id;
  } catch (error) {
    logFirestoreError('Erreur lors de la création de la session:', error);
    throw error;
  }
};

export const getWorkoutSessions = async (userId: string, limitCount: number = 10): Promise<WorkoutSession[]> => {
  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WorkoutSession));
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des sessions:', error);
    return [];
  }
};

export const getWorkoutSessionById = async (sessionId: string): Promise<WorkoutSession | null> => {
  try {
    const docRef = doc(db, 'workoutSessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as WorkoutSession;
    }
    return null;
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération de la session:', error);
    return null;
  }
};

export const updateWorkoutSession = async (sessionId: string, data: Partial<WorkoutSession>): Promise<void> => {
  try {
    const docRef = doc(db, 'workoutSessions', sessionId);
    await updateDoc(docRef, data);
  } catch (error) {
    logFirestoreError('Erreur lors de la mise à jour de la session:', error);
    throw error;
  }
};

export const deleteWorkoutSession = async (sessionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'workoutSessions', sessionId));
  } catch (error) {
    logFirestoreError('Erreur lors de la suppression de la session:', error);
    throw error;
  }
};

// Fonctions pour les records personnels
export const createPersonalRecord = async (
  userId: string,
  recordData: Omit<PersonalRecord, 'id' | 'userId' | 'createdAt'>
): Promise<string> => {
  try {
    const recordRef = doc(collection(db, 'personalRecords'));
    const record: PersonalRecord = {
      ...recordData,
      userId,
      createdAt: serverTimestamp()
    };
    await setDoc(recordRef, record);
    return recordRef.id;
  } catch (error) {
    logFirestoreError('Erreur lors de la création du record:', error);
    throw error;
  }
};

export const getPersonalRecords = async (userId: string): Promise<PersonalRecord[]> => {
  try {
    const q = query(
      collection(db, 'personalRecords'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PersonalRecord));
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des records:', error);
    return [];
  }
};

export const getPersonalRecordsByExercise = async (
  userId: string,
  exerciseName: string
): Promise<PersonalRecord[]> => {
  try {
    const q = query(
      collection(db, 'personalRecords'),
      where('userId', '==', userId),
      where('exerciseName', '==', exerciseName),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PersonalRecord));
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des records:', error);
    return [];
  }
};

export const updatePersonalRecord = async (recordId: string, data: Partial<PersonalRecord>): Promise<void> => {
  try {
    const docRef = doc(db, 'personalRecords', recordId);
    await updateDoc(docRef, data);
  } catch (error) {
    logFirestoreError('Erreur lors de la mise à jour du record:', error);
    throw error;
  }
};

export const deletePersonalRecord = async (recordId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'personalRecords', recordId));
  } catch (error) {
    logFirestoreError('Erreur lors de la suppression du record:', error);
    throw error;
  }
};

// Fonction utilitaire pour les statistiques
export const getWorkoutStats = async (userId: string) => {
  try {
    const sessions = await getWorkoutSessions(userId, 100);
    const totalWorkouts = sessions.length;
    const totalDuration = sessions.reduce((acc, session) => acc + session.duration, 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    return {
      totalWorkouts,
      totalDuration,
      avgDuration
    };
  } catch (error) {
    logFirestoreError('Erreur lors du calcul des statistiques:', error);
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      avgDuration: 0
    };
  }
};

// Interface pour le profil utilisateur
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
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

// Interface pour les préférences utilisateur
export interface UserPreferences {
  userId: string;
  units: {
    weight: 'kg' | 'lbs';
    distance: 'km' | 'mi';
    height: 'cm' | 'in';
  };
  notifications: {
    workoutReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    prAlerts: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

// Interface pour le suivi du poids
export interface WeightEntry {
  id?: string;
  userId: string;
  weight: number; // en kg
  date: Timestamp;
  notes?: string;
  createdAt: any;
}

// Interface pour les objectifs
export interface Goal {
  id?: string;
  userId: string;
  type: 'workout_frequency' | 'weight' | 'volume' | 'cardio' | 'custom';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Timestamp;
  completed: boolean;
  createdAt: any;
  updatedAt: any;
}

// Fonctions pour le profil utilisateur
export const createUserProfile = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const profile: Partial<UserProfile> = {
      ...profileData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, profile, { merge: true });
  } catch (error) {
    logFirestoreError('Erreur lors de la création du profil:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    logFirestoreError('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// Fonctions pour les préférences utilisateur
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    // Créer des préférences par défaut si elles n'existent pas
    const defaultPrefs: UserPreferences = {
      userId,
      units: {
        weight: 'kg',
        distance: 'km',
        height: 'cm'
      },
      notifications: {
        workoutReminders: true,
        achievementAlerts: true,
        weeklyReports: false,
        prAlerts: true
      },
      privacy: {
        profilePublic: false,
        showStats: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, defaultPrefs);
    return defaultPrefs;
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des préférences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  userId: string,
  data: Partial<UserPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    logFirestoreError('Erreur lors de la mise à jour des préférences:', error);
    throw error;
  }
};

// Fonctions pour le suivi du poids
export const createWeightEntry = async (
  userId: string,
  entryData: Omit<WeightEntry, 'id' | 'userId' | 'createdAt'>
): Promise<string> => {
  try {
    const entryRef = doc(collection(db, 'weightEntries'));
    const entry: WeightEntry = {
      ...entryData,
      userId,
      createdAt: serverTimestamp()
    };
    await setDoc(entryRef, entry);
    
    // Mettre à jour le poids dans le profil utilisateur
    await updateUserProfile(userId, { weight: entryData.weight });
    
    return entryRef.id;
  } catch (error) {
    logFirestoreError('Erreur lors de la création de l\'entrée de poids:', error);
    throw error;
  }
};

export const getWeightEntries = async (userId: string, limitCount: number = 30): Promise<WeightEntry[]> => {
  try {
    const q = query(
      collection(db, 'weightEntries'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WeightEntry));
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des entrées de poids:', error);
    return [];
  }
};

export const deleteWeightEntry = async (entryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'weightEntries', entryId));
  } catch (error) {
    logFirestoreError('Erreur lors de la suppression de l\'entrée de poids:', error);
    throw error;
  }
};

// Fonctions pour les objectifs
export const createGoal = async (
  userId: string,
  goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const goalRef = doc(collection(db, 'goals'));
    const goal: Goal = {
      ...goalData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(goalRef, goal);
    return goalRef.id;
  } catch (error) {
    logFirestoreError('Erreur lors de la création de l\'objectif:', error);
    throw error;
  }
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Goal));
  } catch (error) {
    logFirestoreError('Erreur lors de la récupération des objectifs:', error);
    return [];
  }
};

export const updateGoal = async (goalId: string, data: Partial<Goal>): Promise<void> => {
  try {
    const docRef = doc(db, 'goals', goalId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    logFirestoreError('Erreur lors de la mise à jour de l\'objectif:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    logFirestoreError('Erreur lors de la suppression de l\'objectif:', error);
    throw error;
  }
};