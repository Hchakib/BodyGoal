# 🔑 Comment Obtenir les Clés Firebase

**Guide étape par étape pour obtenir toutes les clés nécessaires.**

---

## 📋 Ce dont tu as besoin

1. **Clés Firebase Client** (pour le frontend)
2. **Clés Firebase Admin** (pour les microservices)
3. **Clé OpenAI** (pour le chatbot)

---

## 🔥 Partie 1 : Clés Firebase Client (Frontend)

### Étape 1 : Aller sur la Console Firebase

1. Va sur https://console.firebase.google.com
2. Sélectionne ton projet **bodygoal-4213e**

### Étape 2 : Récupérer les clés

1. Clique sur l'icône **⚙️ (Settings)** en haut à gauche
2. Clique sur **Project Settings**
3. Scroll vers le bas jusqu'à **Your apps**
4. Tu devrais voir ton app web
5. Copie les valeurs dans **SDK setup and configuration**

### Étape 3 : Mettre à jour `.env`

Édite le fichier **`.env`** à la racine :

```env
VITE_API_BASE_URL=http://localhost:3000

VITE_FIREBASE_API_KEY=AIzaSy... (copie depuis Firebase Console)
VITE_FIREBASE_AUTH_DOMAIN=bodygoal-4213e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bodygoal-4213e
VITE_FIREBASE_STORAGE_BUCKET=bodygoal-4213e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Note :** Ces clés sont déjà dans ton code frontend actuel dans `/firebase/config.ts`. Tu peux copier de là !

---

## 🔐 Partie 2 : Clés Firebase Admin (Microservices)

### Étape 1 : Générer une clé privée

1. Toujours dans **Project Settings**
2. Va sur l'onglet **Service Accounts**
3. Clique sur **Generate new private key**
4. Confirme en cliquant **Generate key**
5. Un fichier JSON sera téléchargé

### Étape 2 : Ouvrir le fichier JSON

Le fichier téléchargé ressemble à ça :

```json
{
  "type": "service_account",
  "project_id": "bodygoal-4213e",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Étape 3 : Extraire les 3 valeurs importantes

Tu as besoin de :
1. **`project_id`** (ex: `bodygoal-4213e`)
2. **`private_key`** (toute la chaîne avec `-----BEGIN...`)
3. **`client_email`** (ex: `firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com`)

### Étape 4 : Mettre à jour TOUS les fichiers .env des services

Tu dois éditer **7 fichiers** :
- `services/auth-service/.env`
- `services/workouts-service/.env`
- `services/nutrition-service/.env`
- `services/pr-service/.env`
- `services/templates-service/.env`
- `services/chatbot-service/.env`

**Dans CHAQUE fichier, remplace :**

```env
PORT=300X  # Ne change pas (différent pour chaque service)
NODE_ENV=development

FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

**⚠️ IMPORTANT pour PRIVATE_KEY :**
- Garde les guillemets doubles `"..."`
- Garde les `\n` (retours à la ligne)
- Copie toute la clé en UNE SEULE ligne

**Exemple de PRIVATE_KEY correcte :**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 🤖 Partie 3 : Clé OpenAI (Chatbot)

### Étape 1 : Aller sur OpenAI

1. Va sur https://platform.openai.com/api-keys
2. Connecte-toi avec ton compte OpenAI

### Étape 2 : Créer une nouvelle clé

1. Clique sur **+ Create new secret key**
2. Donne-lui un nom (ex: "BodyGoal Chatbot")
3. Clique sur **Create secret key**
4. **⚠️ COPIE LA CLÉ IMMÉDIATEMENT** (tu ne pourras plus la revoir)

La clé ressemble à : `sk-proj-abc123...`

### Étape 3 : Mettre à jour chatbot-service/.env

Édite **`services/chatbot-service/.env`** :

```env
PORT=3006
NODE_ENV=development

FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com

OPENAI_API_KEY=sk-proj-abc123...  # ← Ta clé OpenAI ici
OPENAI_MODEL=gpt-4o-mini
```

---

## ✅ Vérification Finale

### Fichiers à avoir édités :

- [ ] `.env` (racine) - Firebase Client
- [ ] `api-gateway/.env` - URLs (normalement OK par défaut)
- [ ] `services/auth-service/.env` - Firebase Admin
- [ ] `services/workouts-service/.env` - Firebase Admin
- [ ] `services/nutrition-service/.env` - Firebase Admin
- [ ] `services/pr-service/.env` - Firebase Admin
- [ ] `services/templates-service/.env` - Firebase Admin
- [ ] `services/chatbot-service/.env` - Firebase Admin + OpenAI

**Total : 8 fichiers .env**

### Valeurs à avoir remplies :

**Frontend (`.env`) :**
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`

**Microservices (tous les `.env` dans `services/`) :**
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_PRIVATE_KEY` (avec guillemets et \n)
- ✅ `FIREBASE_CLIENT_EMAIL`

**Chatbot uniquement :**
- ✅ `OPENAI_API_KEY`

---

## 🚀 Après la Configuration

Une fois tous les `.env` remplis :

```bash
# Lance les microservices
docker-compose up --build

# Dans un autre terminal, teste
node test-health.js
```

**Résultat attendu :** 7/7 services OK ✅

---

## 🐛 Problèmes Courants

### Erreur : "Firebase project ID is not set"

**Solution :** Vérifie que `FIREBASE_PROJECT_ID` est bien rempli dans tous les `.env`

---

### Erreur : "Invalid private key"

**Cause :** La `FIREBASE_PRIVATE_KEY` est mal formatée

**Solution :**
1. Assure-toi que la clé est entre guillemets doubles : `"..."`
2. Assure-toi que les `\n` sont présents
3. Copie toute la clé en UNE SEULE ligne
4. Ne mets PAS d'espaces avant ou après

**Bon format :**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
```

**Mauvais format :**
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQ...
-----END PRIVATE KEY-----
```

---

### Erreur : "OpenAI API key is not set"

**Solution :** Vérifie que `OPENAI_API_KEY` est bien rempli dans `services/chatbot-service/.env`

---

### Erreur : "Cannot connect to Firebase"

**Solution :**
1. Vérifie que les clés sont correctes
2. Vérifie que ton projet Firebase existe
3. Vérifie que Firestore est activé dans Firebase Console

---

## 📝 Astuce Rapide

**Pour copier la PRIVATE_KEY facilement :**

1. Ouvre le fichier JSON téléchargé
2. Copie la valeur de `"private_key"`
3. Elle est déjà au bon format avec `\n`
4. Colle-la directement dans les `.env`

**Exemple :**
```json
// Dans le JSON téléchargé :
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"

// Copie exactement cette valeur (avec les guillemets) dans .env :
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
```

---

## ✅ Checklist Finale

- [ ] Téléchargé le fichier JSON de Firebase
- [ ] Extrait les 3 valeurs (project_id, private_key, client_email)
- [ ] Rempli tous les 8 fichiers `.env`
- [ ] Créé une clé OpenAI
- [ ] Vérifié le format de PRIVATE_KEY (guillemets + \n)
- [ ] Lancé `docker-compose up --build`
- [ ] Testé avec `node test-health.js`

---

**Une fois tout configuré, passe à l'étape suivante !** 🚀

Voir `TEST_GUIDE.md` pour tester l'application complète.
