# 🔧 Fix des Dockerfiles

## ⚠️ Problème

Les "Dockerfiles" ont été créés comme des **dossiers** au lieu de **fichiers**.

Fichiers incorrects :
- `/api-gateway/Dockerfile/` (dossier)
- `/services/auth-service/Dockerfile/` (dossier)
- `/services/workouts-service/Dockerfile/` (dossier)
- `/services/nutrition-service/Dockerfile/` (dossier)
- `/services/pr-service/Dockerfile/` (dossier)
- `/services/templates-service/Dockerfile/` (dossier)
- `/services/chatbot-service/Dockerfile/` (dossier)

## ✅ Solution

J'ai créé des fichiers `Dockerfile.prod` qui fonctionnent correctement et mis à jour `docker-compose.yml` pour les utiliser.

---

## 🚀 Action à faire manuellement

### Option 1 : Garder Dockerfile.prod (RECOMMANDÉ)

**Rien à faire !** Le `docker-compose.yml` utilise déjà `Dockerfile.prod`.

Lance simplement :
```bash
docker-compose up --build
```

### Option 2 : Créer les vrais Dockerfiles

Si tu veux avoir des fichiers nommés exactement `Dockerfile` :

```bash
# 1. Supprimer les dossiers incorrects
rm -rf api-gateway/Dockerfile
rm -rf services/auth-service/Dockerfile
rm -rf services/workouts-service/Dockerfile
rm -rf services/nutrition-service/Dockerfile
rm -rf services/pr-service/Dockerfile
rm -rf services/templates-service/Dockerfile
rm -rf services/chatbot-service/Dockerfile

# 2. Renommer les fichiers .prod
mv api-gateway/Dockerfile.prod api-gateway/Dockerfile
mv services/auth-service/Dockerfile.prod services/auth-service/Dockerfile
mv services/workouts-service/Dockerfile.prod services/workouts-service/Dockerfile
mv services/nutrition-service/Dockerfile.prod services/nutrition-service/Dockerfile
mv services/pr-service/Dockerfile.prod services/pr-service/Dockerfile
mv services/templates-service/Dockerfile.prod services/templates-service/Dockerfile
mv services/chatbot-service/Dockerfile.prod services/chatbot-service/Dockerfile

# 3. Mettre à jour docker-compose.yml
# Remplacer "dockerfile: Dockerfile.prod" par "dockerfile: Dockerfile"
# OU supprimer les lignes "dockerfile:" pour utiliser le nom par défaut
```

---

## 📝 Contenu des Dockerfiles

Tous les Dockerfiles ont le même contenu (sauf le port) :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001  # Change selon le service

CMD ["npm", "start"]
```

Ports par service :
- API Gateway : 3000
- Auth Service : 3001
- Workouts Service : 3002
- Nutrition Service : 3003
- PR Service : 3004
- Templates Service : 3005
- Chatbot Service : 3006

---

## ✅ État actuel

**Fichiers opérationnels :**
- ✅ `api-gateway/Dockerfile.prod`
- ✅ `services/auth-service/Dockerfile.prod`
- ✅ `services/workouts-service/Dockerfile.prod`
- ✅ `services/nutrition-service/Dockerfile.prod`
- ✅ `services/pr-service/Dockerfile.prod`
- ✅ `services/templates-service/Dockerfile.prod`
- ✅ `services/chatbot-service/Dockerfile.prod`

**docker-compose.yml :**
- ✅ Mis à jour pour utiliser `Dockerfile.prod`

**Tu peux lancer :**
```bash
docker-compose up --build
```

Tout devrait fonctionner ! 🎉

---

## 🐛 Si tu as des erreurs Docker

```bash
# Nettoyer complètement Docker
docker-compose down -v
docker system prune -af

# Relancer
docker-compose up --build
```
