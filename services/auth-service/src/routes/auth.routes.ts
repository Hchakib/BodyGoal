import { Router } from 'express';
import {
  registerUser,
  getUserProfile,
  updateUserProfile,
  verifyUserToken,
} from '../controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Créer un nouveau profil utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - email
 *               - displayName
 *             properties:
 *               uid:
 *                 type: string
 *               email:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profil créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /verify:
 *   get:
 *     summary: Vérifier la validité d'un token Firebase
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *       401:
 *         description: Token invalide ou expiré
 */
router.get('/verify', verifyToken, verifyUserToken);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Profil non trouvé
 */
router.get('/profile', verifyToken, getUserProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               photoURL:
 *                 type: string
 *               bio:
 *                 type: string
 *               age:
 *                 type: number
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.put('/profile', verifyToken, updateUserProfile);

export default router;
