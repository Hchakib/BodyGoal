import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import { createUser, getUser, updateUser } from '../services/auth.service';

/**
 * Créer un nouveau profil utilisateur dans Firestore
 */
export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, displayName } = req.body;

    if (!uid || !email || !displayName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'uid, email et displayName sont requis',
      });
    }

    const user = await createUser(uid, { email, displayName });

    res.status(201).json({
      message: 'Profil utilisateur créé avec succès',
      user,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await getUser(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Profil utilisateur non trouvé',
      });
    }

    res.json({
      user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur
 */
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const updateData = req.body;

    // Empêcher la modification de certains champs sensibles
    delete updateData.uid;
    delete updateData.email;
    delete updateData.createdAt;

    const updatedUser = await updateUser(userId, updateData);

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Vérifier la validité du token
 */
export const verifyUserToken = async (req: AuthRequest, res: Response) => {
  // Si on arrive ici, c'est que le token est valide (grâce au middleware)
  res.json({
    message: 'Token valide',
    userId: req.userId,
    user: req.user,
  });
};
