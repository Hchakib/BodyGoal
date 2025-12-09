import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';

// Extend Express Request pour inclure le userId
export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * Middleware pour vérifier le token Firebase
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Ajouter le userId à la requête
    req.userId = decodedToken.uid;
    req.user = decodedToken;

    next();
  } catch (error: any) {
    console.error('Token verification error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
};
