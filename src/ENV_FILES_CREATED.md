# ✅ Fichiers .env.example Créés

**Tous les fichiers de configuration ont été créés !**

---

## 📦 Fichiers Créés (8 au total)

### 1. `.env.example` (racine)
**Chemin :** `/.env.example`  
**Usage :** Configuration du frontend React

**Contenu :**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=bodygoal-4213e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bodygoal-4213e
VITE_FIREBASE_STORAGE_BUCKET=bodygoal-4213e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

### 2. `api-gateway/.env.example`
**Chemin :** `/api-gateway/.env.example`  
**Usage :** Configuration de l'API Gateway

**Contenu :**
```env
PORT=3000
NODE_ENV=development
AUTH_SERVICE_URL=http://auth-service:3001
WORKOUTS_SERVICE_URL=http://workouts-service:3002
NUTRITION_SERVICE_URL=http://nutrition-service:3003
PR_SERVICE_URL=http://pr-service:3004
TEMPLATES_SERVICE_URL=http://templates-service:3005
CHATBOT_SERVICE_URL=http://chatbot-service:3006
```

**Note :** Ces URLs sont pour Docker. Pas besoin de les modifier !

---

### 3. `services/auth-service/.env.example`
**Chemin :** `/services/auth-service/.env.example`  
**Usage :** Configuration du service d'authentification

**Contenu :**
```env
PORT=3001
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**À modifier :** Les 3 clés Firebase

---

### 4. `services/workouts-service/.env.example`
**Chemin :** `/services/workouts-service/.env.example`  
**Usage :** Configuration du service workouts

**Contenu :**
```env
PORT=3002
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**À modifier :** Les 3 clés Firebase (mêmes que auth-service)

---

### 5. `services/nutrition-service/.env.example`
**Chemin :** `/services/nutrition-service/.env.example`  
**Usage :** Configuration du service nutrition

**Contenu :**
```env
PORT=3003
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**À modifier :** Les 3 clés Firebase (mêmes que auth-service)

---

### 6. `services/pr-service/.env.example`
**Chemin :** `/services/pr-service/.env.example`  
**Usage :** Configuration du service personal records

**Contenu :**
```env
PORT=3004
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**À modifier :** Les 3 clés Firebase (mêmes que auth-service)

---

### 7. `services/templates-service/.env.example`
**Chemin :** `/services/templates-service/.env.example`  
**Usage :** Configuration du service templates

**Contenu :**
```env
PORT=3005
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**À modifier :** Les 3 clés Firebase (mêmes que auth-service)

---

### 8. `services/chatbot-service/.env.example`
**Chemin :** `/services/chatbot-service/.env.example`  
**Usage :** Configuration du service chatbot avec OpenAI

**Contenu :**
```env
PORT=3006
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI_ICI
OPENAI_MODEL=gpt-4o-mini
```

**À modifier :** Les 3 clés Firebase + la clé OpenAI

---

## 🚀 Prochaines Étapes

### Étape 1 : Copier les .env.example vers .env

```bash
chmod +x setup-env-simple.sh
./setup-env-simple.sh
```

Cela va créer tous les fichiers `.env` à partir des `.env.example`.

---

### Étape 2 : Obtenir les clés Firebase

Lis le guide complet : **`OBTENIR_CLES_FIREBASE.md`**

**Résumé rapide :**

1. **Firebase Console** → https://console.firebase.google.com
2. **Project Settings** → **Service Accounts**
3. **Generate new private key**
4. Télécharge le fichier JSON
5. Extrais les 3 valeurs :
   - `project_id`
   - `private_key`
   - `client_email`

---

### Étape 3 : Remplir TOUS les .env

**Frontend (`.env`) :**
- Copie les valeurs depuis `/firebase/config.ts` (déjà dans ton code)
- OU copie depuis Firebase Console → Project Settings → Your apps

**Microservices (7 fichiers dans `services/`) :**
- Remplis avec les 3 valeurs du fichier JSON téléchargé
- **IMPORTANT :** Les mêmes valeurs pour les 7 services !

**Chatbot uniquement :**
- Ajoute ta clé OpenAI depuis https://platform.openai.com/api-keys

---

### Étape 4 : Vérifier la configuration

```bash
chmod +x check-env.sh
./check-env.sh
```

**Résultat attendu :**
```
✅ .env - OK
✅ api-gateway/.env - OK
✅ services/auth-service/.env - OK
✅ services/workouts-service/.env - OK
✅ services/nutrition-service/.env - OK
✅ services/pr-service/.env - OK
✅ services/templates-service/.env - OK
✅ services/chatbot-service/.env - OK

✅ Tous les fichiers .env sont OK !
```

---

## 📝 Valeurs à Remplir

### Pour TOUS les services (auth, workouts, nutrition, pr, templates, chatbot)

**Les 3 mêmes valeurs partout :**

```env
FIREBASE_PROJECT_ID=bodygoal-4213e  # Ne change pas
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**⚠️ PRIVATE_KEY doit :**
- Avoir des guillemets doubles `"..."`
- Contenir les `\n` (retours à la ligne)
- Être sur UNE SEULE ligne

---

### Pour le chatbot uniquement (en plus des clés Firebase)

```env
OPENAI_API_KEY=sk-proj-abc123...  # Ta clé OpenAI
OPENAI_MODEL=gpt-4o-mini  # Ne change pas
```

---

## 🎯 Récapitulatif

**Nombre de fichiers .env.example créés :** 8  
**Nombre de fichiers .env à créer :** 8  
**Nombre de clés Firebase différentes :** 1 (les mêmes pour tous les services)  
**Nombre de clés OpenAI :** 1 (uniquement chatbot)

---

## ✅ Checklist

- [ ] Tous les .env.example existent (8 fichiers)
- [ ] Script setup-env-simple.sh créé
- [ ] Script check-env.sh créé
- [ ] Guide OBTENIR_CLES_FIREBASE.md créé
- [ ] Copié .env.example → .env avec le script
- [ ] Obtenu les clés Firebase (fichier JSON)
- [ ] Rempli tous les .env avec les clés
- [ ] Obtenu la clé OpenAI
- [ ] Rempli chatbot-service/.env avec OpenAI
- [ ] Vérifié avec check-env.sh
- [ ] Prêt à lancer docker-compose ! 🚀

---

## 🐛 Problèmes ?

**"setup-env-simple.sh: permission denied"**
```bash
chmod +x setup-env-simple.sh
./setup-env-simple.sh
```

**"check-env.sh: command not found"**
```bash
chmod +x check-env.sh
./check-env.sh
```

**"Fichiers .env.example manquants"**
- Ils sont tous créés ! Vérifie avec `ls -la`

**"Je ne sais pas où trouver les clés Firebase"**
- Lis `OBTENIR_CLES_FIREBASE.md`

---

**Prochaine action :** Lance `./setup-env-simple.sh` ! 🎯
