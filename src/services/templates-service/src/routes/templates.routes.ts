import { Router } from 'express';
import {
  createTemplateController,
  getTemplatesController,
  getTemplateByIdController,
  updateTemplateController,
  deleteTemplateController,
  scheduleWorkoutController,
  getScheduledWorkoutsController,
  completeScheduledWorkoutController,
  deleteScheduledWorkoutController,
} from '../controllers/templates.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Routes pour les templates
router.post('/templates', verifyToken, createTemplateController);
router.get('/templates', verifyToken, getTemplatesController);
router.get('/templates/:id', verifyToken, getTemplateByIdController);
router.put('/templates/:id', verifyToken, updateTemplateController);
router.delete('/templates/:id', verifyToken, deleteTemplateController);

// Routes pour les workouts planifiés
router.post('/scheduled', verifyToken, scheduleWorkoutController);
router.get('/scheduled', verifyToken, getScheduledWorkoutsController);
router.put('/scheduled/:id/complete', verifyToken, completeScheduledWorkoutController);
router.delete('/scheduled/:id', verifyToken, deleteScheduledWorkoutController);

export default router;
