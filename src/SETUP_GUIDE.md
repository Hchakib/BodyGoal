# 🚀 Guide de Configuration BodyGoal - Architecture Microservices

Ce guide te permettra de configurer et lancer l'application complète en **10 minutes**.

## 📋 Prérequis

- [ ] **Node.js 18+** installé ([télécharger](https://nodejs.org/))
- [ ] **Docker Desktop** installé ([télécharger](https://www.docker.com/products/docker-desktop/))
- [ ] **Git** installé
- [ ] **Compte Firebase** configuré

---

## 🔥 Étape 1 : Configuration Firebase (5 minutes)

### 1.1 Obtenir les clés Firebase

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet **bodygoal-4213e**
3. Va dans **⚙️ Paramètres du projet** → **Comptes de service**
4. Clique sur **Générer une nouvelle clé privée**
5. Télécharge le fichier JSON

### 1.2 Copier les variables d'environnement

Le fichier JSON téléchargé contient :
```json
{
  "project_id": "bodygoal-4213e",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com"
}
```

### 1.3 Créer les fichiers .env

Dans **CHAQUE service**, copie `.env.example` vers `.env` et remplis avec tes clés :

```bash
# Dans chaque dossier : services/xxx-service/
cp .env.example .env
```

**Exemple de fichier `.env` :**
```env
PORT=3001  # Change selon le service
NODE_ENV=development

FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTA_CLE_COMPLETE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**⚠️ IMPORTANT** : Garde les guillemets autour de `FIREBASE_PRIVATE_KEY` et ne supprime pas les `\n`.

### 1.4 Configurer le Chatbot Service

Pour le fichier `services/chatbot-service/.env`, ajoute aussi :
```env
OPENAI_API_KEY=sk-proj-TON_CLE_ICI
```

---

## 🐳 Étape 2 : Lancer avec Docker (2 minutes)

### Option A : Tout lancer d'un coup (Recommandé pour démo)

```bash
# À la racine du projet
docker-compose up --build
```

Attends 2-3 minutes que tout se construise. Tu verras :
```
✅ bodygoal-auth       ... done
✅ bodygoal-workouts   ... done
✅ bodygoal-nutrition  ... done
✅ bodygoal-pr         ... done
✅ bodygoal-templates  ... done
✅ bodygoal-chatbot    ... done
✅ bodygoal-gateway    ... done
✅ bodygoal-frontend   ... done
```

### Option B : Lancer en arrière-plan

```bash
docker-compose up -d --build
```

### Vérifier que tout fonctionne

```bash
# Voir les logs
docker-compose logs -f

# Vérifier les services actifs
docker-compose ps
```

---

## 💻 Étape 3 : Accéder à l'Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application React |
| **API Gateway** | http://localhost:3000 | Point d'entrée API |
| **Auth Service** | http://localhost:3001/api-docs | Documentation Swagger |
| **Workouts Service** | http://localhost:3002/api-docs | Documentation Swagger |
| **Nutrition Service** | http://localhost:3003/health | Health check |
| **PR Service** | http://localhost:3004/health | Health check |
| **Templates Service** | http://localhost:3005/health | Health check |
| **Chatbot Service** | http://localhost:3006/health | Health check |

---

## 🛠️ Étape 4 : Développement Local (Sans Docker)

Si tu veux développer sans Docker :

### 4.1 Installer toutes les dépendances

```bash
# Script d'installation automatique
chmod +x install-all.sh
./install-all.sh
```

Ou manuellement :
```bash
cd api-gateway && npm install && cd ..
cd services/auth-service && npm install && cd ../..
cd services/workouts-service && npm install && cd ../..
cd services/nutrition-service && npm install && cd ../..
cd services/pr-service && npm install && cd ../..
cd services/templates-service && npm install && cd ../..
cd services/chatbot-service && npm install && cd ../..
cd frontend && npm install && cd ..
```

### 4.2 Lancer les services en mode dev

**Dans des terminaux séparés** :

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

---

## 🧪 Étape 5 : Tester l'Application

### Test 1 : Health Checks

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Tous les services
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3006/health
```

### Test 2 : API Gateway Routing

```bash
# Via le gateway
curl http://localhost:3000/api/auth/verify
curl http://localhost:3000/api/workouts/health
```

### Test 3 : Frontend

Ouvre http://localhost:5173 et :
1. Crée un compte ou connecte-toi
2. Va sur la page Workouts
3. Teste le chatbot

---

## 🎓 Pour la Présentation École

### Points à démontrer :

1. **Architecture microservices** :
   - Montre le `docker-compose.yml`
   - Explique chaque service

2. **API Gateway** :
   - Montre comment tout passe par le port 3000
   - Affiche les routes dans `api-gateway/src/index.ts`

3. **Documentation Swagger** :
   - Ouvre http://localhost:3001/api-docs
   - Teste une route depuis Swagger

4. **Scalabilité** :
   - Arrête un service : `docker-compose stop workouts-service`
   - Montre que les autres continuent de fonctionner
   - Redémarre-le : `docker-compose start workouts-service`

5. **Logs centralisés** :
   - `docker-compose logs -f auth-service`
   - Montre les logs HTTP avec Morgan

### Commandes utiles pour la démo :

```bash
# Arrêter tous les services
docker-compose down

# Rebuild un service spécifique
docker-compose up -d --build auth-service

# Voir les ressources utilisées
docker stats

# Supprimer tout et repartir de zéro
docker-compose down -v
docker-compose up --build
```

---

## 🔧 Dépannage

### Problème : Services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier si les ports sont occupés
lsof -i :3000  # MacOS/Linux
netstat -ano | findstr :3000  # Windows

# Arrêter et nettoyer
docker-compose down
docker system prune -a
docker-compose up --build
```

### Problème : Firebase Auth Error

- Vérifie que `FIREBASE_PRIVATE_KEY` contient bien les `\n`
- Vérifie que la clé est entre guillemets
- Régénère la clé dans Firebase Console si nécessaire

### Problème : Frontend ne se connecte pas

- Vérifie que `VITE_API_BASE_URL=http://localhost:3000` dans frontend/.env
- Vérifie que l'API Gateway tourne sur le port 3000

---

## 📚 Structure du Projet

```
BodyGoal/
├── api-gateway/              ← Point d'entrée central
├── services/                 ← Tous les microservices
│   ├── auth-service/
│   ├── workouts-service/
│   ├── nutrition-service/
│   ├── pr-service/
│   ├── templates-service/
│   └── chatbot-service/
├── frontend/                 ← Application React
├── docker-compose.yml        ← Configuration Docker
└── README.md
```

---

## 🎉 C'est Prêt !

Ton architecture microservices est maintenant opérationnelle !

**Prochaines étapes** :
- Teste toutes les fonctionnalités
- Prépare ta présentation
- Documente les choix d'architecture
- Prends des screenshots pour le rapport

**Besoin d'aide ?**
- Consulte la documentation Swagger : http://localhost:3001/api-docs
- Vérifie les logs : `docker-compose logs -f`
- Teste les health checks : http://localhost:XXXX/health

---

**Bonne chance pour ton projet d'école ! 🚀**
