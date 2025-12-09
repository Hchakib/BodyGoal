import { Router } from 'express';
import {
  createWorkoutController,
  getWorkoutsController,
  getWorkoutByIdController,
  updateWorkoutController,
  deleteWorkoutController,
  getStatsController,
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
 *                 example: "Séance Pectoraux"
 *               type:
 *                 type: string
 *                 example: "Musculation"
 *               duration:
 *                 type: number
 *                 example: 60
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Workout créé avec succès
 */
router.post('/workouts', verifyToken, createWorkoutController);

/**
 * @swagger
 * /workouts/stats:
 *   get:
 *     summary: Récupérer les statistiques des workouts
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
router.get('/workouts/stats', verifyToken, getStatsController);

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
