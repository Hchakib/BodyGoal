import { Router } from 'express';
import {
  createPRController,
  getPRsController,
  getPRByIdController,
  updatePRController,
  deletePRController,
} from '../controllers/pr.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Routes CRUD pour les PRs
router.post('/pr', verifyToken, createPRController);
router.get('/pr', verifyToken, getPRsController);
router.get('/pr/:id', verifyToken, getPRByIdController);
router.put('/pr/:id', verifyToken, updatePRController);
router.delete('/pr/:id', verifyToken, deletePRController);

export default router;
