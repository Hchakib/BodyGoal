# 🧪 Guide de Test - BodyGoal Microservices

**Guide complet pour tester ton application après la migration.**

---

## 📋 Pré-requis

- [ ] Docker Desktop installé et lancé
- [ ] Tous les `.env` configurés avec clés Firebase + OpenAI
- [ ] Node.js installé (pour le test health)

---

## 🚀 Étape 1 : Lancer les Microservices

### 1.1 Démarrer Docker Compose

```bash
docker-compose up --build
```

**Temps d'attente :** 2-3 minutes pour que tous les services démarrent.

### 1.2 Vérifier que tout est UP

Dans un autre terminal :

```bash
docker-compose ps
```

**Résultat attendu :**
```
NAME                    STATUS
bodygoal-gateway       Up
bodygoal-auth          Up
bodygoal-workouts      Up
bodygoal-nutrition     Up
bodygoal-pr            Up
bodygoal-templates     Up
bodygoal-chatbot       Up
```

**Si un service est "Exited" ou "Restarting" :**
```bash
# Voir les logs du service
docker-compose logs -f nom-du-service

# Exemple
docker-compose logs -f auth-service
```

---

## ✅ Étape 2 : Health Checks

### 2.1 Test automatique

```bash
node test-health.js
```

**Résultat attendu :**
```
🏥 Testing BodyGoal Microservices Health...

✅ API Gateway (port 3000) - OK
✅ Auth Service (port 3001) - OK
✅ Workouts Service (port 3002) - OK
✅ Nutrition Service (port 3003) - OK
✅ PR Service (port 3004) - OK
✅ Templates Service (port 3005) - OK
✅ Chatbot Service (port 3006) - OK

🎉 Tous les services sont en ligne !
```

### 2.2 Test manuel

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Workouts Service
curl http://localhost:3002/health

# Nutrition Service
curl http://localhost:3003/health

# PR Service
curl http://localhost:3004/health

# Templates Service
curl http://localhost:3005/health

# Chatbot Service
curl http://localhost:3006/health
```

**Chaque service doit répondre avec :**
```json
{
  "status": "OK",
  "service": "nom-du-service",
  "timestamp": "..."
}
```

---

## 📖 Étape 3 : Test Swagger

### 3.1 Ouvrir Swagger UI

**Auth Service :**
- URL : http://localhost:3001/api-docs
- Devrait afficher la documentation complète des routes Auth

**Workouts Service :**
- URL : http://localhost:3002/api-docs
- Devrait afficher la documentation complète des routes Workouts

### 3.2 Tester un endpoint dans Swagger

1. Va sur http://localhost:3001/api-docs
2. Clique sur `GET /auth/verify`
3. Clique sur "Try it out"
4. Entre un token Firebase dans le header `Authorization`
5. Clique sur "Execute"
6. Vérifie la réponse

---

## 🎨 Étape 4 : Test Frontend

### 4.1 Lancer le frontend

```bash
npm run dev
```

**Résultat attendu :**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4.2 Ouvrir le navigateur

1. Va sur http://localhost:5173
2. Ouvre **DevTools** (F12)
3. Va sur l'onglet **Network**

### 4.3 Se connecter

1. Clique sur "Login"
2. Connecte-toi avec ton compte
3. **Vérifie dans Network** :
   - Aucune requête vers `firestore.googleapis.com` (ancien système)
   - Toutes les requêtes vont vers `localhost:3000` (nouveau système)

---

## 🏋️ Étape 5 : Test des Fonctionnalités

### 5.1 Test Workouts

**Action :** Créer un nouveau workout

1. Va sur la page "History" ou "Start Session"
2. Crée un nouveau workout avec des exercices
3. Sauvegarde

**Vérification Network :**
```
Request URL: http://localhost:3000/api/workouts/workouts
Request Method: POST
Status Code: 201 Created

Request Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
  Content-Type: application/json

Response:
{
  "message": "Workout created successfully",
  "workout": { ... }
}
```

**Vérification Console Docker :**
```bash
docker-compose logs -f workouts-service
```

Tu devrais voir :
```
workouts-service | POST /workouts 201 - - 45.123 ms
```

---

### 5.2 Test Nutrition

**Action :** Ajouter un repas

1. Va sur la page "Nutrition"
2. Clique sur "Add Meal"
3. Remplis les informations
4. Sauvegarde

**Vérification Network :**
```
Request URL: http://localhost:3000/api/nutrition/meals
Request Method: POST
Status Code: 201 Created
```

---

### 5.3 Test Personal Records

**Action :** Ajouter un PR

1. Va sur la page "PR"
2. Clique sur "Add PR"
3. Sélectionne un exercice et entre le poids/reps
4. Sauvegarde

**Vérification Network :**
```
Request URL: http://localhost:3000/api/pr/pr
Request Method: POST
Status Code: 201 Created
```

---

### 5.4 Test Templates

**Action :** Créer un template

1. Va sur la page "Templates"
2. Clique sur "Create Template"
3. Crée un template avec des exercices
4. Sauvegarde

**Vérification Network :**
```
Request URL: http://localhost:3000/api/templates/templates
Request Method: POST
Status Code: 201 Created
```

---

### 5.5 Test Chatbot

**Action :** Envoyer un message

1. Ouvre le chatbot (icône en bas à droite)
2. Envoie un message : "Montre-moi mes derniers workouts"
3. Attends la réponse

**Vérification Network :**
```
Request URL: http://localhost:3000/api/chatbot/chat
Request Method: POST
Status Code: 200 OK
```

---

## 🔍 Étape 6 : Vérifications Avancées

### 6.1 Vérifier les Logs en Temps Réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f workouts-service
```

### 6.2 Vérifier les Données dans Firestore

1. Va sur https://console.firebase.google.com
2. Sélectionne ton projet
3. Va dans "Firestore Database"
4. Vérifie que les collections sont créées :
   - `users`
   - `workoutSessions`
   - `personalRecords`
   - `workoutTemplates`
   - etc...

### 6.3 Test de Scalabilité

**Arrêter un service :**
```bash
docker-compose stop nutrition-service
```

**Vérifier que les autres fonctionnent :**
- Workouts → ✅ Fonctionne
- PRs → ✅ Fonctionne
- Nutrition → ❌ Erreur (normal)

**Redémarrer le service :**
```bash
docker-compose start nutrition-service
```

**Vérifier que tout remarche :**
- Nutrition → ✅ Fonctionne

---

## 🎯 Checklist de Test Complète

### Backend

- [ ] Docker Compose démarre sans erreur
- [ ] Les 7 services sont UP (`docker-compose ps`)
- [ ] Health checks retournent 7/7 OK
- [ ] Swagger accessible sur 3001 et 3002
- [ ] Logs visibles avec `docker-compose logs -f`

### Frontend

- [ ] Frontend démarre sur port 5173
- [ ] Connexion fonctionne
- [ ] Pas de requêtes vers firestore.googleapis.com
- [ ] Toutes les requêtes vont vers localhost:3000

### Fonctionnalités

- [ ] Créer un workout → POST /api/workouts/workouts
- [ ] Voir les workouts → GET /api/workouts/workouts
- [ ] Ajouter un repas → POST /api/nutrition/meals
- [ ] Ajouter un PR → POST /api/pr/pr
- [ ] Créer un template → POST /api/templates/templates
- [ ] Discuter avec chatbot → POST /api/chatbot/chat

### Tests Avancés

- [ ] Arrêter un service → Les autres continuent
- [ ] Redémarrer un service → Fonctionne à nouveau
- [ ] Logs en temps réel visibles
- [ ] Données visibles dans Firestore Console

---

## 🐛 Problèmes Courants et Solutions

### Problème : Service ne démarre pas

**Symptôme :**
```
bodygoal-auth    Exited (1)
```

**Solution :**
```bash
# Voir les logs
docker-compose logs auth-service

# Vérifier le .env
cat services/auth-service/.env

# Rebuild le service
docker-compose up --build auth-service
```

---

### Problème : "Cannot connect to API"

**Symptôme :** Frontend affiche "Network Error"

**Solution :**
1. Vérifie `.env` à la racine : `VITE_API_BASE_URL=http://localhost:3000`
2. Vérifie que API Gateway tourne : `curl http://localhost:3000/health`
3. Redémarre le frontend : `npm run dev`

---

### Problème : "401 Unauthorized"

**Symptôme :** Toutes les requêtes retournent 401

**Solution :**
1. Déconnecte-toi et reconnecte-toi
2. Vérifie que le token est envoyé : DevTools > Network > Headers
3. Vérifie les clés Firebase dans les `.env` des services

---

### Problème : "CORS Error"

**Symptôme :**
```
Access to fetch at 'http://localhost:3000/api/workouts/workouts' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution :**
1. Vérifie que chaque service a `app.use(cors())` dans `src/index.ts`
2. Redémarre : `docker-compose restart`

---

### Problème : Port déjà utilisé

**Symptôme :**
```
Error: bind: address already in use
```

**Solution :**
```bash
# Voir ce qui utilise le port
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# OU changer le port dans docker-compose.yml
```

---

## 📊 Résumé des Tests

**Si tous les tests passent :**
- ✅ Backend 100% fonctionnel
- ✅ Frontend 100% migré
- ✅ Architecture microservices opérationnelle
- ✅ Prêt pour la présentation !

**Si certains tests échouent :**
- Consulte la section "Problèmes Courants"
- Vérifie les logs : `docker-compose logs -f`
- Vérifie les .env
- Redémarre les services : `docker-compose restart`

---

## 🎓 Prochaines Étapes

1. [ ] Tous les tests passent
2. [ ] Préparer la démo pour la présentation
3. [ ] Prendre des screenshots
4. [ ] Documenter les points clés

---

**Besoin d'aide ?**
- Consulte `MIGRATION_COMPLETE.md` pour l'architecture
- Consulte `API_ROUTES.md` pour toutes les routes
- Consulte `DOCKERFILE_FIX.md` pour les problèmes Docker

---

**Bon courage pour les tests ! 🧪**

Une fois tous les tests passés, ton projet est **100% prêt** ! 🎉
