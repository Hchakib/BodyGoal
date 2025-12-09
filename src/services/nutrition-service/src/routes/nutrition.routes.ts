import { Router } from 'express';
import {
  createMealController,
  getMealsController,
  deleteMealController,
  getGoalsController,
  updateGoalsController,
  getStatsController,
} from '../controllers/nutrition.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Routes pour les repas
router.post('/meals', verifyToken, createMealController);
router.get('/meals', verifyToken, getMealsController);
router.delete('/meals/:id', verifyToken, deleteMealController);

// Routes pour les objectifs
router.get('/goals', verifyToken, getGoalsController);
router.put('/goals', verifyToken, updateGoalsController);

// Routes pour les statistiques
router.get('/stats', verifyToken, getStatsController);

export default router;
