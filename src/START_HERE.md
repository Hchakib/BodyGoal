# 🚀 START HERE - Guide Ultra-Rapide

**Pour démarrer ton projet BodyGoal Microservices en 3 étapes.**

---

## ⚠️ NOTE IMPORTANTE

Les Dockerfiles sont nommés `Dockerfile.prod` car il y avait un conflit de noms.  
Le `docker-compose.yml` est déjà configuré pour les utiliser automatiquement.

**Aucune action requise** - Lance simplement `docker-compose up --build` !

---

## ✅ ÉTAPE 1 : Configuration (5 minutes)

### Copie les fichiers .env :

```bash
cp .env.example .env
cp api-gateway/.env.example api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/workouts-service/.env.example services/workouts-service/.env
cp services/nutrition-service/.env.example services/nutrition-service/.env
cp services/pr-service/.env.example services/pr-service/.env
cp services/templates-service/.env.example services/templates-service/.env
cp services/chatbot-service/.env.example services/chatbot-service/.env
```

### Remplis les clés Firebase :

Dans **CHAQUE fichier `.env` de service**, remplace :

```env
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTA_CLE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

⚠️ **Important :** La clé privée doit garder les `\n` et les guillemets !

### Ajoute ta clé OpenAI :

Dans `services/chatbot-service/.env` :

```env
OPENAI_API_KEY=sk-proj-TA_CLE_OPENAI
```

---

## ✅ ÉTAPE 2 : Lancer les microservices (2 minutes)

```bash
docker-compose up --build
```

Attends 2-3 minutes que tout démarre. Tu verras :

```
✅ bodygoal-gateway   ... Up
✅ bodygoal-auth      ... Up
✅ bodygoal-workouts  ... Up
✅ bodygoal-nutrition ... Up
✅ bodygoal-pr        ... Up
✅ bodygoal-templates ... Up
✅ bodygoal-chatbot   ... Up
```

### Teste que tout marche :

```bash
node test-health.js
```

Résultat attendu :
```
✅ API Gateway (port 3000) - OK
✅ Auth Service (port 3001) - OK
✅ Workouts Service (port 3002) - OK
✅ Nutrition Service (port 3003) - OK
✅ PR Service (port 3004) - OK
✅ Templates Service (port 3005) - OK
✅ Chatbot Service (port 3006) - OK

🎉 Tous les services sont en ligne !
```

---

## ✅ ÉTAPE 3 : Adapter le Frontend (10 minutes)

### 3.1 Configure l'URL de l'API

Édite `.env` à la racine :

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3.2 Modifie UN hook pour tester

Exemple avec `hooks/useWorkouts.ts` :

**Remplace :**
```typescript
import { getWorkoutSessions } from '../firebase/firestore';

const loadWorkouts = async () => {
  const data = await getWorkoutSessions(currentUser.uid, limitCount);
  setWorkouts(data);
};
```

**Par :**
```typescript
import { workoutsApi } from '../services/api';

const loadWorkouts = async () => {
  const response = await workoutsApi.getWorkouts(limitCount);
  setWorkouts(response.workouts);
};
```

### 3.3 Teste le frontend

```bash
npm run dev
```

Ouvre http://localhost:5173 et essaie de créer un workout.

Ouvre DevTools > Network : tu dois voir des requêtes vers `localhost:3000/api/workouts/...`

---

## 🎉 C'EST PRÊT !

### Accès rapide :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application React |
| **API Gateway** | http://localhost:3000 | Point d'entrée API |
| **Swagger Auth** | http://localhost:3001/api-docs | Doc Auth Service |
| **Swagger Workouts** | http://localhost:3002/api-docs | Doc Workouts Service |

---

## 🐛 Problèmes ?

### Les services ne démarrent pas

```bash
# Voir les logs
docker-compose logs -f

# Vérifier les services
docker-compose ps
```

### "Cannot connect to Firebase"

➡️ Vérifie que `FIREBASE_PRIVATE_KEY` a bien les `\n` et les guillemets.

### "Port already in use"

```bash
# Arrêter tous les services
docker-compose down

# Nettoyer et redémarrer
docker-compose up --build
```

### Frontend : "Network Error"

➡️ Vérifie que `VITE_API_BASE_URL=http://localhost:3000` dans `.env`

---

## 📚 Documentation complète

- **Démarrage rapide** : `QUICK_START.md`
- **Migration frontend** : `FRONTEND_MIGRATION_GUIDE.md`
- **Routes API** : `API_ROUTES.md`
- **Architecture** : `ARCHITECTURE.md`
- **État du projet** : `STATUS.md`

---

## 🎓 Pour la présentation

1. Lance `docker-compose up`
2. Montre `docker-compose ps` (tous UP)
3. Ouvre Swagger : http://localhost:3001/api-docs
4. Teste un endpoint
5. Montre le chatbot qui fonctionne

---

**Tu es prêt ! 🚀**

Si tu veux plus de détails, lis `STATUS.md` qui résume tout.