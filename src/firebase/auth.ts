import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Interface pour les données utilisateur
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
  updatedAt: any;
}

// Inscription avec email et mot de passe
export const registerWithEmail = async (
  email: string,
  password: string,
  fullName: string
): Promise<User> => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mettre à jour le profil avec le nom
    await updateProfile(user, {
      displayName: fullName
    });

    // Créer le document utilisateur dans Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName: fullName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return user;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Connexion avec email et mot de passe
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Connexion avec Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Vérifier si c'est la première connexion et créer le profil si nécessaire
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Utilisateur',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }

    return user;
  } catch (error: any) {
    console.error('Erreur lors de la connexion avec Google:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Connexion avec GitHub
export const loginWithGithub = async (): Promise<User> => {
  try {
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Vérifier si c'est la première connexion et créer le profil si nécessaire
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Utilisateur',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }

    return user;
  } catch (error: any) {
    console.error('Erreur lors de la connexion avec GitHub:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Erreur lors de la déconnexion:', error);
    throw new Error('Erreur lors de la déconnexion');
  }
};

// Obtenir le profil utilisateur depuis Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

// Fonction utilitaire pour traduire les erreurs Firebase
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Email invalide.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/operation-not-allowed': 'Opération non autorisée.',
    'auth/weak-password': 'Le mot de passe est trop faible (minimum 6 caractères).',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'auth/user-not-found': 'Aucun utilisateur trouvé avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-login-credentials': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée.',
    'auth/cancelled-popup-request': 'Connexion annulée.',
    'auth/popup-blocked': 'La fenêtre popup a été bloquée par le navigateur.',
    'auth/unauthorized-domain': 'Ce domaine n\'est pas autorisé. Veuillez configurer les domaines autorisés dans Firebase Console.',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email mais avec un autre provider.',
    'auth/credential-already-in-use': 'Ces identifiants sont déjà utilisés.',
    'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion internet.',
  };

  return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};