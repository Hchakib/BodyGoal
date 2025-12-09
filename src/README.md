# 🏋️ BodyGoal - Architecture Microservices

Application web de fitness tracking avec architecture microservices pour projet d'école.

---

## ⚠️ IMPORTANT - Dockerfiles

Les Dockerfiles sont nommés **`Dockerfile.prod`** car il y avait un conflit de noms.  
Le `docker-compose.yml` est déjà configuré pour les utiliser automatiquement.

**Pas d'action requise** - Lance simplement `docker-compose up --build` !

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
│  Port 5173  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
│  Port 3000  │
└──────┬──────┘
       │
       ├─────────► Auth Service (3001)
       ├─────────► Workouts Service (3002)
       ├─────────► Nutrition Service (3003)
       ├─────────► PR Service (3004)
       ├─────────► Templates Service (3005)
       └─────────► Chatbot Service (3006)
                         │
                         ▼
                   Firebase Firestore
```

## 📁 Structure du Projet

```
BodyGoal/
├── api-gateway/              # API Gateway (Port 3000)
├── services/
│   ├── auth-service/        # Service d'authentification (Port 3001)
│   ├── workouts-service/    # Service workouts (Port 3002)
│   ├── nutrition-service/   # Service nutrition (Port 3003)
│   ├── pr-service/          # Service records personnels (Port 3004)
│   ├── templates-service/   # Service templates (Port 3005)
│   └── chatbot-service/     # Service chatbot GPT-4 (Port 3006)
├── frontend/                 # Application React (Port 5173)
├── docker-compose.yml        # Orchestration Docker
└── README.md
```

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Node.js 18+ (pour développement local)
- Compte Firebase configuré

### 1. Configuration des variables d'environnement

Copier les fichiers `.env.example` dans chaque service et remplir les valeurs :

```bash
# Dans chaque dossier services/xxx-service/
cp .env.example .env
```

### 2. Lancer avec Docker Compose

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

### 3. Accéder à l'application

- Frontend : http://localhost:5173
- API Gateway : http://localhost:3000
- Auth Service : http://localhost:3001
- Workouts Service : http://localhost:3002
- Nutrition Service : http://localhost:3003
- PR Service : http://localhost:3004
- Templates Service : http://localhost:3005
- Chatbot Service : http://localhost:3006

### 4. Documentation API

- Auth Service : http://localhost:3001/api-docs
- Workouts Service : http://localhost:3002/api-docs

## 🛠️ Développement Local (sans Docker)

### Installer les dépendances

```bash
# API Gateway
cd api-gateway && npm install

# Tous les services
cd services/auth-service && npm install
cd ../workouts-service && npm install
cd ../nutrition-service && npm install
cd ../pr-service && npm install
cd ../templates-service && npm install
cd ../chatbot-service && npm install

# Frontend
cd ../../frontend && npm install
```

### Lancer les services individuellement

Dans des terminaux séparés :

```bash
# Terminal 1 - API Gateway
cd api-gateway && npm run dev

# Terminal 2 - Auth Service
cd services/auth-service && npm run dev

# Terminal 3 - Workouts Service
cd services/workouts-service && npm run dev

# Terminal 4 - Nutrition Service
cd services/nutrition-service && npm run dev

# Terminal 5 - PR Service
cd services/pr-service && npm run dev

# Terminal 6 - Templates Service
cd services/templates-service && npm run dev

# Terminal 7 - Chatbot Service
cd services/chatbot-service && npm run dev

# Terminal 8 - Frontend
cd frontend && npm run dev
```

## 📊 Collections Firestore

Chaque microservice accède à des collections spécifiques :

| Service | Collections Firestore |
|---------|----------------------|
| **Auth Service** | `users`, `userPreferences` |
| **Workouts Service** | `workoutSessions` |
| **Nutrition Service** | `users/{userId}/nutrition`, `users/{userId}/nutritionGoals` |
| **PR Service** | `personalRecords` |
| **Templates Service** | `workoutTemplates` |
| **Chatbot Service** | `users/{userId}/chatHistory` |

## 🔑 Variables d'Environnement

Chaque service nécessite un fichier `.env` :

```env
# Configuration commune à tous les services
PORT=300X
NODE_ENV=development

# Firebase (même config pour tous les services)
FIREBASE_PROJECT_ID=ton-projet-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com

# Pour le Chatbot Service uniquement
OPENAI_API_KEY=sk-proj-xxxxx
```

## 📝 Scripts Disponibles

```bash
# Démarrer tous les services avec Docker
npm run docker:up

# Arrêter tous les services
npm run docker:down

# Voir les logs
npm run docker:logs

# Rebuild les services
npm run docker:rebuild
```

## 🎓 Pour Présentation École

### Points à mentionner :

1. ✅ **Architecture microservices** avec 6 services indépendants
2. ✅ **API Gateway** comme point d'entrée unique
3. ✅ **Docker & Docker Compose** pour l'orchestration
4. ✅ **Base de données centralisée** (Firebase Firestore)
5. ✅ **APIs REST** avec Node.js + Express + TypeScript
6. ✅ **Documentation Swagger** pour auth et workouts
7. ✅ **Logs HTTP** avec Morgan
8. ✅ **Authentification JWT** via Firebase
9. ✅ **Scalabilité** : chaque service peut être déployé séparément

## 📚 Technologies Utilisées

- **Frontend** : React, Vite, TypeScript, Tailwind CSS
- **Backend** : Node.js, Express, TypeScript
- **Base de données** : Firebase Firestore
- **Authentication** : Firebase Auth
- **AI** : OpenAI GPT-4o-mini (chatbot)
- **Documentation** : Swagger/OpenAPI
- **Conteneurisation** : Docker, Docker Compose
- **Logs** : Morgan

## 🔒 Sécurité

- Authentification via Firebase Auth
- Vérification des tokens JWT sur chaque requête
- Variables d'environnement pour les clés sensibles
- CORS configuré

## 📖 Documentation Complète

Voir les README individuels dans chaque dossier de service pour plus de détails.

---

**Projet d'école - Architecture Microservices**  
Créé avec ❤️ pour démontrer une architecture moderne et scalable.