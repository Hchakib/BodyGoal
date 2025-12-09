# 🔄 Guide de Migration du Frontend vers les Microservices

Ce guide explique comment migrer le frontend de l'ancienne architecture Firebase directe vers la nouvelle architecture microservices.

---

## 📊 État Actuel

**❌ Frontend actuel :** Utilise Firebase directement
- Les hooks appellent `../firebase/firestore.ts`
- Communication directe avec Firestore
- Pas de passage par l'API Gateway

**✅ Objectif :** Frontend utilise les microservices
- Les hooks appellent `/services/api.ts`
- Communication via l'API Gateway (port 3000)
- Architecture découplée et scalable

---

## 🔧 Étape 1 : Configuration

### 1.1 Créer le fichier `.env`

À la racine du projet frontend :

```bash
cp .env.example .env
```

Puis édite `.env` :

```env
VITE_API_BASE_URL=http://localhost:3000

# Firebase (pour auth uniquement)
VITE_FIREBASE_API_KEY=ta_clé_ici
VITE_FIREBASE_AUTH_DOMAIN=bodygoal-4213e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bodygoal-4213e
VITE_FIREBASE_STORAGE_BUCKET=bodygoal-4213e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ton_id
VITE_FIREBASE_APP_ID=ton_app_id
```

---

## 📝 Étape 2 : Migrer les Hooks

### Option A : Migration Complète (Recommandée)

Remplace tous les hooks pour utiliser l'API Gateway.

#### Exemple : `useWorkouts.ts`

**❌ Avant (Firebase direct) :**

```typescript
import { getWorkoutSessions } from '../firebase/firestore';

export function useWorkouts() {
  const loadWorkouts = async () => {
    const data = await getWorkoutSessions(currentUser.uid, limitCount);
    setWorkouts(data);
  };
}
```

**✅ Après (API Gateway) :**

```typescript
import { workoutsApi } from '../services/api';

export function useWorkouts() {
  const loadWorkouts = async () => {
    const response = await workoutsApi.getWorkouts(limitCount);
    setWorkouts(response.workouts);
  };
}
```

### Option B : Migration Progressive (Coexistence)

Garde les deux systèmes et bascule progressivement.

```typescript
const USE_MICROSERVICES = import.meta.env.VITE_USE_MICROSERVICES === 'true';

const loadWorkouts = async () => {
  if (USE_MICROSERVICES) {
    // Nouvelle architecture
    const response = await workoutsApi.getWorkouts(limitCount);
    setWorkouts(response.workouts);
  } else {
    // Ancienne architecture
    const data = await getWorkoutSessions(currentUser.uid, limitCount);
    setWorkouts(data);
  }
};
```

---

## 🔄 Étape 3 : Hooks à Migrer

### 3.1 `useWorkouts.ts`

```typescript
import { workoutsApi } from '../services/api';

export function useWorkouts(limitCount: number = 10) {
  const loadWorkouts = async () => {
    const response = await workoutsApi.getWorkouts(limitCount);
    setWorkouts(response.workouts);
  };

  const addWorkout = async (workoutData: any) => {
    const response = await workoutsApi.createWorkout(workoutData);
    await loadWorkouts();
  };

  const updateWorkout = async (id: string, data: any) => {
    await workoutsApi.updateWorkout(id, data);
    await loadWorkouts();
  };

  const deleteWorkout = async (id: string) => {
    await workoutsApi.deleteWorkout(id);
    await loadWorkouts();
  };
}
```

### 3.2 `useNutrition.ts`

```typescript
import { nutritionApi } from '../services/api';

export function useNutrition() {
  const loadMeals = async (startDate?: Date, endDate?: Date) => {
    const start = startDate?.toISOString();
    const end = endDate?.toISOString();
    const response = await nutritionApi.getMeals(start, end);
    setMeals(response.meals);
  };

  const addMeal = async (mealData: any) => {
    await nutritionApi.addMeal(mealData);
    await loadMeals();
  };

  const loadGoals = async () => {
    const response = await nutritionApi.getGoals();
    setGoals(response.goals);
  };
}
```

### 3.3 `usePersonalRecords.ts`

```typescript
import { prApi } from '../services/api';

export function usePersonalRecords() {
  const loadPRs = async () => {
    const response = await prApi.getPRs();
    setPrs(response.prs);
  };

  const addPR = async (prData: any) => {
    await prApi.createPR(prData);
    await loadPRs();
  };
}
```

### 3.4 `useWorkoutTemplates.ts`

```typescript
import { templatesApi } from '../services/api';

export function useWorkoutTemplates() {
  const loadTemplates = async () => {
    const response = await templatesApi.getTemplates();
    setTemplates(response.templates);
  };

  const createTemplate = async (templateData: any) => {
    await templatesApi.createTemplate(templateData);
    await loadTemplates();
  };
}
```

### 3.5 `useScheduledWorkouts.ts`

```typescript
import { templatesApi } from '../services/api';

export function useScheduledWorkouts() {
  const loadScheduled = async () => {
    const response = await templatesApi.getScheduledWorkouts();
    setScheduled(response.workouts);
  };

  const scheduleWorkout = async (data: any) => {
    await templatesApi.scheduleWorkout(data);
    await loadScheduled();
  };

  const completeWorkout = async (id: string) => {
    await templatesApi.completeWorkout(id);
    await loadScheduled();
  };
}
```

### 3.6 `useChatbot.ts`

```typescript
import { chatbotApi } from '../services/api';

export function useChatbot() {
  const sendMessage = async (message: string, userContext?: any) => {
    const response = await chatbotApi.sendMessage({
      message,
      history: conversationHistory,
      userContext,
    });
    
    return response.message;
  };

  const loadHistory = async () => {
    const response = await chatbotApi.getHistory();
    setHistory(response.history);
  };

  const clearHistory = async () => {
    await chatbotApi.clearHistory();
    setHistory([]);
  };
}
```

### 3.7 `useUserProfile.ts`

```typescript
import { authApi } from '../services/api';

export function useUserProfile() {
  const loadProfile = async () => {
    const response = await authApi.getProfile();
    setProfile(response.profile);
  };

  const updateProfile = async (data: any) => {
    await authApi.updateProfile(data);
    await loadProfile();
  };
}
```

---

## 🧪 Étape 4 : Test

### 4.1 Démarrer les microservices

```bash
docker-compose up --build
```

Attends que tous les services soient UP.

### 4.2 Vérifier les services

```bash
node test-health.js
```

Tu devrais voir :
```
✅ API Gateway (port 3000) - OK
✅ Auth Service (port 3001) - OK
✅ Workouts Service (port 3002) - OK
...
```

### 4.3 Démarrer le frontend

```bash
npm run dev
```

### 4.4 Test dans le navigateur

1. Connecte-toi à l'app
2. Ouvre les DevTools > Network
3. Fais une action (créer un workout)
4. Vérifie que la requête va vers `http://localhost:3000/api/workouts/...`

---

## 🔍 Étape 5 : Débogage

### Problème : "CORS error"

**Solution :** Vérifie que l'API Gateway et tous les services ont CORS activé :

```typescript
// Dans chaque service
app.use(cors());
```

### Problème : "401 Unauthorized"

**Solution :** Vérifie que le token Firebase est bien envoyé :

```typescript
// Dans services/api.ts
headers: {
  'Authorization': `Bearer ${token}`,
}
```

### Problème : "Network error"

**Solution :** Vérifie que les services tournent :

```bash
docker-compose ps
```

Tous doivent être "Up".

### Problème : "Cannot connect to API"

**Solution :** Vérifie `.env` :

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📦 Étape 6 : Nettoyage (Optionnel)

Une fois la migration complète, tu peux :

1. **Garder les anciennes fonctions Firebase** (pour rollback)
2. **OU Supprimer** les anciennes fonctions :

```bash
# NE PAS faire ça tout de suite !
rm -rf firebase/firestore.ts
rm -rf firebase/nutrition.ts
rm -rf firebase/workoutTemplates.ts
# etc...
```

⚠️ **Recommandation** : Garde les anciennes fonctions pendant 1-2 semaines pour être sûr.

---

## 🎯 Checklist de Migration

- [ ] Fichier `.env` créé et configuré
- [ ] Service API (`/services/api.ts`) importé
- [ ] Hook `useWorkouts` migré
- [ ] Hook `useNutrition` migré
- [ ] Hook `usePersonalRecords` migré
- [ ] Hook `useWorkoutTemplates` migré
- [ ] Hook `useScheduledWorkouts` migré
- [ ] Hook `useChatbot` migré
- [ ] Hook `useUserProfile` migré
- [ ] Tests effectués avec succès
- [ ] Pas d'erreurs dans la console
- [ ] Network tab montre les requêtes vers `localhost:3000`

---

## 🚀 Prochaines Étapes

Une fois la migration terminée :

1. **Déploiement** : Déploie les microservices séparément
2. **Monitoring** : Ajoute des logs et métriques
3. **Tests** : Écris des tests automatisés
4. **Documentation** : Mets à jour la doc du projet

---

## 💡 Conseils

- **Migre un hook à la fois** pour identifier les problèmes rapidement
- **Garde Firebase Auth** : L'authentification reste côté frontend
- **Teste après chaque migration** : Ne migre pas tout d'un coup
- **Utilise les DevTools** : Network tab pour voir les requêtes
- **Check les logs Docker** : `docker-compose logs -f` pour debugger

---

**Besoin d'aide ?** Consulte `API_ROUTES.md` pour voir toutes les routes disponibles.
