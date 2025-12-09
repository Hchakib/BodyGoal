# 📡 Documentation des Routes API - BodyGoal

Toutes les routes passent par l'**API Gateway** : `http://localhost:3000`

## 🔐 Authentification

Toutes les routes protégées nécessitent un header :
```
Authorization: Bearer <FIREBASE_TOKEN>
```

---

## 🔑 Auth Service (`/api/auth`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Créer un profil utilisateur | ❌ |
| GET | `/api/auth/verify` | Vérifier un token | ✅ |
| GET | `/api/auth/profile` | Récupérer le profil | ✅ |
| PUT | `/api/auth/profile` | Mettre à jour le profil | ✅ |

### Exemples

**Créer un profil :**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }'
```

**Récupérer le profil :**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏋️ Workouts Service (`/api/workouts`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/workouts/workouts` | Liste des workouts | ✅ |
| POST | `/api/workouts/workouts` | Créer un workout | ✅ |
| GET | `/api/workouts/workouts/stats` | Statistiques | ✅ |
| GET | `/api/workouts/workouts/:id` | Récupérer un workout | ✅ |
| PUT | `/api/workouts/workouts/:id` | Modifier un workout | ✅ |
| DELETE | `/api/workouts/workouts/:id` | Supprimer un workout | ✅ |

### Exemples

**Créer un workout :**
```bash
curl -X POST http://localhost:3000/api/workouts/workouts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Séance Pectoraux",
    "type": "Musculation",
    "duration": 60,
    "date": "2024-01-15T10:00:00Z",
    "exercises": [
      {
        "name": "Développé couché",
        "sets": [
          { "reps": 10, "weight": 80 },
          { "reps": 10, "weight": 85 }
        ]
      }
    ]
  }'
```

**Récupérer les workouts :**
```bash
curl -X GET "http://localhost:3000/api/workouts/workouts?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🥗 Nutrition Service (`/api/nutrition`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/nutrition/meals` | Liste des repas | ✅ |
| POST | `/api/nutrition/meals` | Ajouter un repas | ✅ |
| DELETE | `/api/nutrition/meals/:id` | Supprimer un repas | ✅ |
| GET | `/api/nutrition/goals` | Objectifs nutritionnels | ✅ |
| PUT | `/api/nutrition/goals` | Modifier les objectifs | ✅ |
| GET | `/api/nutrition/stats` | Statistiques nutrition | ✅ |

### Exemples

**Ajouter un repas :**
```bash
curl -X POST http://localhost:3000/api/nutrition/meals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mealName": "Poulet grillé avec riz",
    "mealType": "lunch",
    "calories": 650,
    "protein": 45,
    "carbs": 60,
    "fats": 15,
    "date": "2024-01-15T12:00:00Z"
  }'
```

**Mettre à jour les objectifs :**
```bash
curl -X PUT http://localhost:3000/api/nutrition/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calories": 2500,
    "protein": 150,
    "carbs": 300,
    "fats": 70
  }'
```

---

## 🏆 Personal Records Service (`/api/pr`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/pr/pr` | Liste des PRs | ✅ |
| POST | `/api/pr/pr` | Créer un PR | ✅ |
| GET | `/api/pr/pr/:id` | Récupérer un PR | ✅ |
| PUT | `/api/pr/pr/:id` | Modifier un PR | ✅ |
| DELETE | `/api/pr/pr/:id` | Supprimer un PR | ✅ |

### Exemples

**Créer un PR :**
```bash
curl -X POST http://localhost:3000/api/pr/pr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseName": "Squat",
    "weight": 140,
    "reps": 5,
    "date": "2024-01-15T10:00:00Z",
    "notes": "Nouveau record !"
  }'
```

**Récupérer les PRs d'un exercice :**
```bash
curl -X GET "http://localhost:3000/api/pr/pr?exerciseName=Squat" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Templates Service (`/api/templates`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/templates/templates` | Liste des templates | ✅ |
| POST | `/api/templates/templates` | Créer un template | ✅ |
| GET | `/api/templates/templates/:id` | Récupérer un template | ✅ |
| PUT | `/api/templates/templates/:id` | Modifier un template | ✅ |
| DELETE | `/api/templates/templates/:id` | Supprimer un template | ✅ |
| GET | `/api/templates/scheduled` | Workouts planifiés | ✅ |
| POST | `/api/templates/scheduled` | Planifier un workout | ✅ |
| PUT | `/api/templates/scheduled/:id/complete` | Marquer comme complété | ✅ |
| DELETE | `/api/templates/scheduled/:id` | Supprimer un workout planifié | ✅ |

### Exemples

**Créer un template :**
```bash
curl -X POST http://localhost:3000/api/templates/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Push Day",
    "type": "Musculation",
    "description": "Séance pectoraux, épaules, triceps",
    "exercises": [
      {
        "name": "Développé couché",
        "sets": 4,
        "reps": 10,
        "weight": 80,
        "restTime": 120
      },
      {
        "name": "Développé épaules",
        "sets": 3,
        "reps": 12,
        "weight": 30
      }
    ]
  }'
```

**Planifier un workout :**
```bash
curl -X POST http://localhost:3000/api/templates/scheduled \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template123",
    "templateName": "Push Day",
    "type": "Musculation",
    "date": "2024-01-20T10:00:00Z",
    "completed": false,
    "exercises": [...]
  }'
```

---

## 🤖 Chatbot Service (`/api/chatbot`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/chatbot/chat` | Envoyer un message | ✅ |
| GET | `/api/chatbot/history` | Récupérer l'historique | ✅ |
| DELETE | `/api/chatbot/history` | Supprimer l'historique | ✅ |

### Exemples

**Envoyer un message :**
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Créé moi un programme de musculation pour débutant",
    "history": [],
    "userContext": {
      "weight": 75,
      "height": 180,
      "age": 25,
      "fitnessGoal": "Prise de masse"
    }
  }'
```

**Récupérer l'historique :**
```bash
curl -X GET "http://localhost:3000/api/chatbot/history?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏥 Health Checks

Chaque service expose un endpoint `/health` :

```bash
curl http://localhost:3000/health          # API Gateway
curl http://localhost:3001/health          # Auth Service
curl http://localhost:3002/health          # Workouts Service
curl http://localhost:3003/health          # Nutrition Service
curl http://localhost:3004/health          # PR Service
curl http://localhost:3005/health          # Templates Service
curl http://localhost:3006/health          # Chatbot Service
```

---

## 📚 Documentation Swagger

- **Auth Service** : http://localhost:3001/api-docs
- **Workouts Service** : http://localhost:3002/api-docs

---

## 🔧 Configuration Frontend

Dans ton application React, configure :

```javascript
// frontend/.env
VITE_API_BASE_URL=http://localhost:3000
```

Exemple de requête depuis React :

```javascript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workouts/workouts`, {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json',
  },
});
```

---

**Bonne chance pour ton projet ! 🚀**
