import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import { sendMessage, getChatHistory, clearChatHistory } from '../services/chatbot.service';

/**
 * Envoyer un message au chatbot
 */
export const sendMessageController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { message, history, userContext } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Le message ne peut pas être vide',
      });
    }

    const response = await sendMessage(userId, message, history, userContext);

    res.json(response);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer l'historique de conversation
 */
export const getHistoryController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await getChatHistory(userId, limit);

    res.json({
      count: history.length,
      history,
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Supprimer l'historique de conversation
 */
export const clearHistoryController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await clearChatHistory(userId);

    res.json({
      message: 'Historique de conversation supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Clear history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
