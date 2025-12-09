# 🏗️ Architecture Microservices - BodyGoal

Documentation technique de l'architecture pour présentation d'école.

---

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    React + Vite + TypeScript                │
│                      Port 5173                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│                   Node.js + Express                         │
│                      Port 3000                              │
│                                                             │
│  • Routing centralisé                                      │
│  • Proxy HTTP vers les microservices                       │
│  • Point d'entrée unique                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬─────────────┐
        │                │                │             │
        ▼                ▼                ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │   Workouts   │  │  Nutrition   │  │  PR Service  │
│   Port 3001  │  │ Service 3002 │  │ Service 3003 │  │  Port 3004   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                │                │                   │
        ▼                ▼                ▼                   ▼
┌──────────────┐  ┌──────────────┐
│  Templates   │  │   Chatbot    │
│ Service 3005 │  │ Service 3006 │
└──────────────┘  └──────────────┘
        │                │
        └────────────────┴────────────────────────────────────┐
                                                               │
                                                               ▼
                                              ┌─────────────────────────────┐
                                              │   Firebase Firestore        │
                                              │   (Base de données)         │
                                              │                             │
                                              │  • users                    │
                                              │  • workoutSessions          │
                                              │  • personalRecords          │
                                              │  • workoutTemplates         │
                                              │  • scheduledWorkouts        │
                                              └─────────────────────────────┘
```

---

## 🎯 Principes de l'Architecture Microservices

### 1. **Séparation des responsabilités**

Chaque service a une responsabilité unique et bien définie :

| Service | Responsabilité | Collections Firestore |
|---------|----------------|----------------------|
| **Auth** | Authentification et profils utilisateurs | `users`, `userPreferences` |
| **Workouts** | Gestion des sessions d'entraînement | `workoutSessions` |
| **Nutrition** | Suivi nutritionnel et objectifs | `users/{userId}/nutrition` |
| **PR** | Records personnels | `personalRecords` |
| **Templates** | Templates et planification | `workoutTemplates`, `scheduledWorkouts` |
| **Chatbot** | Assistant IA avec GPT-4o-mini | `users/{userId}/chatHistory` |

### 2. **Indépendance et découplage**

- ✅ Chaque service peut être développé indépendamment
- ✅ Chaque service a son propre `package.json` et dépendances
- ✅ Chaque service peut être déployé séparément
- ✅ Pas de dépendances directes entre services

### 3. **Communication via API Gateway**

- Tous les appels passent par l'API Gateway (port 3000)
- Le frontend ne connaît que l'API Gateway
- Le gateway route vers le bon microservice
- Facilite la gestion de la sécurité et des logs

### 4. **Base de données partagée**

- Firebase Firestore comme base de données centralisée
- Collections séparées par domaine métier
- Chaque service n'accède qu'à ses collections

---

## 🔧 Stack Technique

### Backend (Tous les services)

- **Langage** : Node.js + TypeScript
- **Framework** : Express.js
- **Base de données** : Firebase Firestore
- **Authentification** : Firebase Auth (tokens JWT)
- **Logs** : Morgan (middleware HTTP)
- **Documentation** : Swagger/OpenAPI (Auth + Workouts)

### API Gateway

- **Proxy HTTP** : http-proxy-middleware
- **Routing** : Express Router

### Chatbot Service

- **IA** : OpenAI GPT-4o-mini
- **Library** : openai@4.20.0

### Conteneurisation

- **Docker** : Dockerfile pour chaque service
- **Orchestration** : Docker Compose
- **Images** : node:18-alpine (légères)

---

## 📦 Structure des Fichiers

```
BodyGoal/
├── api-gateway/
│   ├── src/
│   │   └── index.ts              # Point d'entrée + routing
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── firebase.config.ts    # Init Firebase Admin
│   │   │   │   └── swagger.ts            # Config Swagger
│   │   │   ├── middleware/
│   │   │   │   └── verifyToken.ts        # Vérification JWT
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts       # Logique métier
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.ts    # Handlers HTTP
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts        # Définition routes
│   │   │   └── index.ts                  # Server Express
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── workouts-service/          # Même structure
│   ├── nutrition-service/         # Même structure
│   ├── pr-service/                # Même structure
│   ├── templates-service/         # Même structure
│   └── chatbot-service/           # Même structure + OpenAI
│
├── docker-compose.yml             # Orchestration complète
├── README.md
├── SETUP_GUIDE.md
├── QUICK_START.md
├── API_ROUTES.md
├── ARCHITECTURE.md                # Ce fichier
├── package.json                   # Scripts root
├── test-health.js                 # Test des services
├── install-all.sh                 # Installation dépendances
└── setup-env.sh                   # Configuration .env
```

---

## 🔐 Sécurité

### Authentification

1. L'utilisateur se connecte via Firebase Auth (frontend)
2. Firebase retourne un **token JWT**
3. Le frontend envoie ce token dans chaque requête :
   ```
   Authorization: Bearer <TOKEN>
   ```
4. Chaque microservice vérifie le token avec Firebase Admin SDK
5. Le middleware `verifyToken` extrait l'`userId` du token
6. Les données sont filtrées par `userId`

### Variables d'environnement

- Clés sensibles dans des fichiers `.env` (non versionnés)
- `.env` ajouté dans `.gitignore`
- `.env.example` comme template

### CORS

- Configuration CORS sur chaque service
- Accepte les requêtes du frontend

---

## 🚀 Déploiement

### Développement Local

```bash
# Option 1 : Docker Compose (recommandé)
docker-compose up --build

# Option 2 : Services séparés
cd api-gateway && npm run dev          # Terminal 1
cd services/auth-service && npm run dev     # Terminal 2
# ... etc
```

### Production (Suggestions)

Chaque service peut être déployé séparément sur :

- **Heroku** : `heroku create bodygoal-auth-service`
- **Google Cloud Run** : Services containerisés
- **AWS ECS** : Elastic Container Service
- **Kubernetes** : Pour scalabilité avancée
- **Railway.app** : Déploiement simple et gratuit

Configuration production :
```env
NODE_ENV=production
AUTH_SERVICE_URL=https://auth-service.example.com
WORKOUTS_SERVICE_URL=https://workouts-service.example.com
# etc...
```

---

## 📈 Scalabilité

### Avantages de l'architecture

1. **Scale horizontal** : Dupliquer un service spécifique
   ```bash
   docker-compose up --scale workouts-service=3
   ```

2. **Isolation des pannes** : Si un service tombe, les autres continuent

3. **Déploiements indépendants** : Modifier un service sans toucher aux autres

4. **Équipes spécialisées** : Chaque équipe peut travailler sur son service

### Monitoring

```bash
# Voir l'utilisation des ressources
docker stats

# Logs d'un service spécifique
docker-compose logs -f auth-service

# Statut des services
docker-compose ps
```

---

## 🧪 Tests

### Health Checks

Chaque service expose `/health` :

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Auth Service',
    timestamp: new Date().toISOString(),
  });
});
```

### Script de test automatique

```bash
node test-health.js
# Teste que tous les services répondent
```

### Tests unitaires (à implémenter)

```bash
# Dans chaque service
npm test

# Exemple avec Jest
npm install --save-dev jest @types/jest
```

---

## 📊 Métriques

### Collections Firestore

| Collection | Description | Taille estimée |
|------------|-------------|----------------|
| `users` | Profils utilisateurs | ~1 KB / user |
| `workoutSessions` | Historique workouts | ~5 KB / session |
| `personalRecords` | Records | ~500 bytes / PR |
| `workoutTemplates` | Templates | ~2 KB / template |
| `users/{id}/nutrition` | Entrées nutritionnelles | ~500 bytes / repas |
| `users/{id}/chatHistory` | Historique chatbot | ~1 KB / message |

### Performance

- Temps de réponse moyen : **< 200ms**
- Authentification : **< 100ms**
- Requête Firestore : **< 50ms**
- Requête OpenAI : **1-3s**

---

## 🎓 Points clés pour la présentation

### 1. Architecture claire

Montre le schéma d'architecture avec les 6 microservices + API Gateway.

### 2. Séparation des responsabilités

Explique pourquoi chaque service est indépendant.

### 3. Docker & Orchestration

Montre `docker-compose.yml` et explique comment tout se connecte.

### 4. API Gateway

Explique le rôle de point d'entrée unique.

### 5. Swagger Documentation

Ouvre http://localhost:3001/api-docs et teste un endpoint en live.

### 6. Scalabilité

Démontre qu'on peut arrêter/redémarrer un service sans impacter les autres.

### 7. Base de données partagée

Explique pourquoi Firebase est adapté pour un projet d'école.

### 8. Logs et monitoring

Montre `docker-compose logs -f` en temps réel.

---

## 🎯 Améliorations possibles (pour discussion)

- ✅ **Message Queue** : RabbitMQ ou Kafka pour communication asynchrone
- ✅ **Service Mesh** : Istio pour gestion avancée du trafic
- ✅ **Cache distribué** : Redis pour améliorer les performances
- ✅ **Tests automatisés** : Jest, Supertest
- ✅ **CI/CD** : GitHub Actions pour déploiement automatique
- ✅ **Monitoring avancé** : Prometheus + Grafana
- ✅ **Rate limiting** : Protection contre les abus
- ✅ **Load balancer** : NGINX pour distribution de charge

---

## 📚 Ressources

- [Microservices Pattern](https://microservices.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [OpenAPI Specification](https://swagger.io/specification/)

---

**Créé pour projet d'école - Architecture Microservices**  
**BodyGoal © 2024**
