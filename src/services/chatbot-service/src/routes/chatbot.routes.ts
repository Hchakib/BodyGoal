import { Router } from 'express';
import {
  sendMessageController,
  getHistoryController,
  clearHistoryController,
} from '../controllers/chatbot.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Routes du chatbot
router.post('/chat', verifyToken, sendMessageController);
router.get('/history', verifyToken, getHistoryController);
router.delete('/history', verifyToken, clearHistoryController);

export default router;
