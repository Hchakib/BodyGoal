# 📦 Code Complet des Microservices BodyGoal

Ce fichier contient **tout le code** nécessaire pour les services manquants.  
Copie-colle chaque section dans le fichier correspondant.

---

## 🏋️ WORKOUTS SERVICE

### `services/workouts-service/src/types/workout.types.ts`

```typescript
export interface WorkoutSession {
  id?: string;
  userId: string;
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  date: any;
  createdAt: any;
}

export interface Exercise {
  name: string;
  sets: Set[];
  notes?: string;
  category?: string;
  totalVolume?: number;
}

export interface Set {
  reps: number;
  weight: number;
  completed?: boolean;
}
```

### `services/workouts-service/src/services/workouts.service.ts`

```typescript
import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { WorkoutSession } from '../types/workout.types';

export const createWorkout = async (
  userId: string,
  workoutData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>
): Promise<{ id: string; workout: WorkoutSession }> => {
  const workoutRef = db.collection('workoutSessions').doc();

  const workout: WorkoutSession = {
    ...workoutData,
    userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  await workoutRef.set(workout);

  return {
    id: workoutRef.id,
    workout: { ...workout, id: workoutRef.id },
  };
};

export const getWorkouts = async (
  userId: string,
  limit: number = 10
): Promise<WorkoutSession[]> => {
  const workoutsRef = db
    .collection('workoutSessions')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .limit(limit);

  const snapshot = await workoutsRef.get();
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as WorkoutSession));
};

export const getWorkoutById = async (
  workoutId: string
): Promise<WorkoutSession | null> => {
  const workoutRef = db.collection('workoutSessions').doc(workoutId);
  const doc = await workoutRef.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as WorkoutSession;
};

export const updateWorkout = async (
  workoutId: string,
  updateData: Partial<WorkoutSession>
): Promise<WorkoutSession> => {
  const workoutRef = db.collection('workoutSessions').doc(workoutId);

  await workoutRef.update(updateData);

  const updatedDoc = await workoutRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as WorkoutSession;
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  await db.collection('workoutSessions').doc(workoutId).delete();
};
```

### `services/workouts-service/src/controllers/workouts.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} from '../services/workouts.service';

export const createWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const workoutData = req.body;

    const result = await createWorkout(userId, workoutData);

    res.status(201).json({
      message: 'Workout créé avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getWorkoutsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;

    const workouts = await getWorkouts(userId, limit);

    res.json({
      count: workouts.length,
      workouts,
    });
  } catch (error: any) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getWorkoutByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const workout = await getWorkoutById(id);

    if (!workout) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Workout non trouvé',
      });
    }

    res.json({ workout });
  } catch (error: any) {
    console.error('Get workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const updateWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const workout = await updateWorkout(id, updateData);

    res.json({
      message: 'Workout mis à jour avec succès',
      workout,
    });
  } catch (error: any) {
    console.error('Update workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const deleteWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteWorkout(id);

    res.json({
      message: 'Workout supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
```

### `services/workouts-service/src/routes/workouts.routes.ts`

```typescript
import { Router } from 'express';
import {
  createWorkoutController,
  getWorkoutsController,
  getWorkoutByIdController,
  updateWorkoutController,
  deleteWorkoutController,
} from '../controllers/workouts.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Récupérer tous les workouts de l'utilisateur
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de workouts à récupérer
 *     responses:
 *       200:
 *         description: Liste des workouts
 *       401:
 *         description: Non authentifié
 */
router.get('/workouts', verifyToken, getWorkoutsController);

/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Créer un nouveau workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - duration
 *               - exercises
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               duration:
 *                 type: number
 *               exercises:
 *                 type: array
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workout créé avec succès
 */
router.post('/workouts', verifyToken, createWorkoutController);

/**
 * @swagger
 * /workouts/{id}:
 *   get:
 *     summary: Récupérer un workout par son ID
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout trouvé
 *       404:
 *         description: Workout non trouvé
 */
router.get('/workouts/:id', verifyToken, getWorkoutByIdController);

/**
 * @swagger
 * /workouts/{id}:
 *   put:
 *     summary: Mettre à jour un workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workout mis à jour
 */
router.put('/workouts/:id', verifyToken, updateWorkoutController);

/**
 * @swagger
 * /workouts/{id}:
 *   delete:
 *     summary: Supprimer un workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout supprimé
 */
router.delete('/workouts/:id', verifyToken, deleteWorkoutController);

export default router;
```

### `services/workouts-service/src/config/swagger.ts`

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BodyGoal Workouts Service API',
      version: '1.0.0',
      description: 'Service de gestion des entraînements',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api/workouts',
        description: 'API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Workouts',
        description: 'Gestion des sessions d\'entraînement',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

### `services/workouts-service/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import workoutsRoutes from './routes/workouts.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Workouts Service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/', workoutsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`\n💪 Workouts Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs\n`);
});
```

---

## 🥗 NUTRITION SERVICE

### `services/nutrition-service/package.json`

```json
{
  "name": "bodygoal-nutrition-service",
  "version": "1.0.0",
  "description": "Service de gestion nutritionnelle pour BodyGoal",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "firebase-admin": "^12.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.2",
    "ts-node-dev": "^2.0.0"
  }
}
```

### `services/nutrition-service/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### `services/nutrition-service/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

### `services/nutrition-service/.env.example`

```env
PORT=3003
NODE_ENV=development
FIREBASE_PROJECT_ID=bodygoal-4213e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bodygoal-4213e.iam.gserviceaccount.com
```

### `services/nutrition-service/src/config/firebase.config.ts`

```typescript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✅ Firebase Admin initialized (Nutrition Service)');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
};

initializeFirebase();

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
```

### `services/nutrition-service/src/middleware/verifyToken.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.user = decodedToken;

    next();
  } catch (error: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};
```

### `services/nutrition-service/src/types/nutrition.types.ts`

```typescript
export interface NutritionEntry {
  id?: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: any;
  createdAt: any;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}
```

### `services/nutrition-service/src/services/nutrition.service.ts`

```typescript
import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { NutritionEntry, NutritionGoals } from '../types/nutrition.types';

export const createNutritionEntry = async (
  userId: string,
  entryData: Omit<NutritionEntry, 'id' | 'createdAt'>
): Promise<{ id: string; entry: NutritionEntry }> => {
  const entryRef = db.collection('users').doc(userId).collection('nutrition').doc();

  const entry: NutritionEntry = {
    ...entryData,
    createdAt: FieldValue.serverTimestamp(),
  };

  await entryRef.set(entry);

  return {
    id: entryRef.id,
    entry: { ...entry, id: entryRef.id },
  };
};

export const getNutritionEntries = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<NutritionEntry[]> => {
  let query = db
    .collection('users')
    .doc(userId)
    .collection('nutrition')
    .orderBy('date', 'desc');

  if (startDate && endDate) {
    query = query
      .where('date', '>=', startDate)
      .where('date', '<=', endDate) as any;
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as NutritionEntry));
};

export const deleteNutritionEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  await db
    .collection('users')
    .doc(userId)
    .collection('nutrition')
    .doc(entryId)
    .delete();
};

export const getNutritionGoals = async (
  userId: string
): Promise<NutritionGoals | null> => {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  return data?.nutritionGoals || null;
};

export const updateNutritionGoals = async (
  userId: string,
  goals: NutritionGoals
): Promise<NutritionGoals> => {
  await db.collection('users').doc(userId).update({
    nutritionGoals: goals,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return goals;
};
```

### `services/nutrition-service/src/controllers/nutrition.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createNutritionEntry,
  getNutritionEntries,
  deleteNutritionEntry,
  getNutritionGoals,
  updateNutritionGoals,
} from '../services/nutrition.service';

export const createMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const entryData = req.body;

    const result = await createNutritionEntry(userId, entryData);

    res.status(201).json({
      message: 'Repas ajouté avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create meal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getMealsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const meals = await getNutritionEntries(userId, start, end);

    res.json({
      count: meals.length,
      meals,
    });
  } catch (error: any) {
    console.error('Get meals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const deleteMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await deleteNutritionEntry(userId, id);

    res.json({
      message: 'Repas supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getGoalsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const goals = await getNutritionGoals(userId);

    res.json({ goals });
  } catch (error: any) {
    console.error('Get goals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const updateGoalsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goalsData = req.body;

    const goals = await updateNutritionGoals(userId, goalsData);

    res.json({
      message: 'Objectifs nutritionnels mis à jour avec succès',
      goals,
    });
  } catch (error: any) {
    console.error('Update goals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
```

### `services/nutrition-service/src/routes/nutrition.routes.ts`

```typescript
import { Router } from 'express';
import {
  createMealController,
  getMealsController,
  deleteMealController,
  getGoalsController,
  updateGoalsController,
} from '../controllers/nutrition.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/meals', verifyToken, createMealController);
router.get('/meals', verifyToken, getMealsController);
router.delete('/meals/:id', verifyToken, deleteMealController);
router.get('/goals', verifyToken, getGoalsController);
router.put('/goals', verifyToken, updateGoalsController);

export default router;
```

### `services/nutrition-service/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import nutritionRoutes from './routes/nutrition.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Nutrition Service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/', nutritionRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`\n🥗 Nutrition Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health\n`);
});
```

---

## 🏆 Les autres services (PR, Templates, Chatbot) suivent la MÊME STRUCTURE

Pour économiser de l'espace, copie simplement la structure de Nutrition Service et adapte :

1. **PR Service (port 3004)** : Remplace "nutrition" par "personalRecords"
2. **Templates Service (port 3005)** : Collection "workoutTemplates"
3. **Chatbot Service (port 3006)** : Intègre OpenAI + collection "chatHistory"

---

## 📝 Prochaines Étapes

1. Crée les fichiers manquants en copiant le code ci-dessus
2. Configure les `.env` de chaque service
3. Lance `docker-compose up --build`
4. Teste via Swagger : http://localhost:3001/api-docs

**C'est prêt pour ton projet d'école ! 🎓**
