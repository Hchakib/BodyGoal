import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Validation des variables d'environnement
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Vérifier que toutes les variables sont définies
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value || value === 'your-firebase-api-key' || value === 'your-project-id')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  console.error('❌ ERREUR: Configuration Firebase manquante ou invalide');
  console.error('═══════════════════════════════════════════════════════');
  console.error('');
  console.error('Variables manquantes ou invalides:', missingVars.join(', '));
  console.error('');
  console.error('📋 SOLUTION RAPIDE (Recommandée):');
  console.error('');
  console.error('   1. Télécharge ta clé Firebase Admin SDK:');
  console.error('      • Va sur https://console.firebase.google.com/');
  console.error('      • Sélectionne ton projet');
  console.error('      • ⚙️  Project Settings > Service Accounts');
  console.error('      • Clique "Generate new private key"');
  console.error('      • Sauvegarde le fichier JSON téléchargé');
  console.error('');
  console.error('   2. Lance le script de configuration automatique:');
  console.error('      PowerShell:  .\\setup-from-firebase-json.ps1');
  console.error('      Bash:        ./setup-from-firebase-json.sh');
  console.error('');
  console.error('   3. Redémarre le serveur frontend');
  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  console.error('📋 SOLUTION MANUELLE (Alternative):');
  console.error('═══════════════════════════════════════════════════════');
  console.error('');
  console.error('   1. Va sur Firebase Console: https://console.firebase.google.com/');
  console.error('   2. Sélectionne ton projet');
  console.error('   3. Clique sur ⚙️  > Project settings');
  console.error('   4. Descends jusqu\'à "Your apps"');
  console.error('   5. Sélectionne ton application Web (ou crée-en une)');
  console.error('   6. Copie les valeurs de firebaseConfig');
  console.error('   7. Édite le fichier /.env à la racine du projet');
  console.error('   8. Remplace les valeurs VITE_FIREBASE_*');
  console.error('   9. Redémarre le serveur: npm run dev');
  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  console.error('');
  
  throw new Error(`❌ Configuration Firebase invalide. Consulte les instructions ci-dessus.`);
}

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('✅ Configuration Firebase chargée avec succès');
console.log(`📦 Projet: ${firebaseConfig.projectId}`);

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;