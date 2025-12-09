# ⚡ Démarrage Rapide - BodyGoal Microservices

Guide ultra-rapide pour lancer l'application en **5 minutes**.

---

## 🎯 Objectif

Lancer l'architecture microservices complète avec Docker.

---

## ✅ Prérequis (2 minutes)

1. **Docker Desktop** installé et démarré
2. **Clés Firebase** prêtes (Project ID, Private Key, Client Email)
3. **Clé OpenAI** (pour le chatbot)

---

## 🚀 Étapes (3 minutes)

### 1. Configurer les fichiers `.env`

Copie `.env.example` vers `.env` dans **chaque service** :

```bash
# Depuis la racine du projet
cp services/auth-service/.env.example services/auth-service/.env
cp services/workouts-service/.env.example services/workouts-service/.env
cp services/nutrition-service/.env.example services/nutrition-service/.env
cp services/pr-service/.env.example services/pr-service/.env
cp services/templates-service/.env.example services/templates-service/.env
cp services/chatbot-service/.env.example services/chatbot-service/.env
cp api-gateway/.env.example api-gateway/.env
```

### 2. Remplir les variables Firebase

Dans **chaque fichier `.env` de service**, remplace :

```env
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

⚠️ **Important** : Garde les `\n` et les guillemets dans `FIREBASE_PRIVATE_KEY` !

### 3. Configurer le Chatbot

Dans `services/chatbot-service/.env`, ajoute :

```env
OPENAI_API_KEY=sk-proj-VOTRE_CLE_ICI
```

### 4. Lancer Docker Compose

```bash
docker-compose up --build
```

Attends 2-3 minutes que tous les services démarrent.

---

## ✅ Vérification

### Test 1 : Health Checks

Ouvre ces URLs dans ton navigateur :

- ✅ http://localhost:3000/health (Gateway)
- ✅ http://localhost:3001/health (Auth)
- ✅ http://localhost:3002/health (Workouts)
- ✅ http://localhost:3003/health (Nutrition)
- ✅ http://localhost:3004/health (PR)
- ✅ http://localhost:3005/health (Templates)
- ✅ http://localhost:3006/health (Chatbot)

### Test 2 : Documentation Swagger

- 📚 http://localhost:3001/api-docs (Auth Service)
- 📚 http://localhost:3002/api-docs (Workouts Service)

### Test 3 : Script de test

```bash
node test-health.js
```

Tu devrais voir :
```
✅ API Gateway (port 3000) - OK
✅ Auth Service (port 3001) - OK
✅ Workouts Service (port 3002) - OK
...
🎉 Tous les services sont en ligne !
```

---

## 🎨 Accès Frontend

Si tu as un frontend React :

```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:5173

---

## 🛠️ Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Voir les services actifs
docker-compose ps

# Arrêter tous les services
docker-compose down

# Rebuild un service spécifique
docker-compose up -d --build auth-service

# Nettoyer complètement
docker-compose down -v
docker system prune -af
```

---

## 🐛 Dépannage Express

### Problème : "Cannot connect to Firebase"

➡️ Vérifie que `FIREBASE_PRIVATE_KEY` contient bien les `\n` :

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Problème : "Port already in use"

➡️ Un service tourne déjà sur ce port :

```bash
# MacOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problème : "OpenAI API key invalid"

➡️ Vérifie dans `services/chatbot-service/.env` :

```env
OPENAI_API_KEY=sk-proj-VOTRE_VRAIE_CLE
```

### Problème : Services ne démarrent pas

➡️ Regarde les logs :

```bash
docker-compose logs auth-service
docker-compose logs workouts-service
```

---

## 🎓 Pour la Présentation École

### Démo 1 : Architecture microservices

```bash
# Montre le docker-compose.yml
cat docker-compose.yml

# Montre les services actifs
docker-compose ps
```

### Démo 2 : Scalabilité

```bash
# Arrête un service
docker-compose stop workouts-service

# Vérifie que les autres continuent
curl http://localhost:3001/health

# Redémarre-le
docker-compose start workouts-service
```

### Démo 3 : API Gateway

```bash
# Requête via le gateway
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Montre que ça redirige vers auth-service
docker-compose logs api-gateway | tail -20
```

### Démo 4 : Swagger

Ouvre http://localhost:3001/api-docs et teste un endpoint.

---

## 📊 Statistiques

```bash
# Voir l'utilisation des ressources
docker stats

# Voir les images
docker images | grep bodygoal
```

---

## ✨ C'est Prêt !

Ton architecture microservices est maintenant **opérationnelle** ! 🎉

**Prochaines étapes :**
1. Teste toutes les routes (voir `API_ROUTES.md`)
2. Configure le frontend pour utiliser `http://localhost:3000`
3. Prépare ta présentation d'école
4. Prends des screenshots

**Documentation complète :** Voir `README.md` et `SETUP_GUIDE.md`

---

**Bonne chance ! 🚀**
