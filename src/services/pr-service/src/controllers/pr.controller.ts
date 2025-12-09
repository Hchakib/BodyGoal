import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createPR,
  getPRs,
  getPRsByExercise,
  getPRById,
  updatePR,
  deletePR,
} from '../services/pr.service';

/**
 * Créer un nouveau PR
 */
export const createPRController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const prData = req.body;

    const result = await createPR(userId, prData);

    res.status(201).json({
      message: 'Record personnel créé avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create PR error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer tous les PRs
 */
export const getPRsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { exerciseName } = req.query;

    let prs;
    if (exerciseName) {
      prs = await getPRsByExercise(userId, exerciseName as string);
    } else {
      prs = await getPRs(userId);
    }

    res.json({
      count: prs.length,
      prs,
    });
  } catch (error: any) {
    console.error('Get PRs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer un PR par ID
 */
export const getPRByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pr = await getPRById(id);

    if (!pr) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Record personnel non trouvé',
      });
    }

    res.json({ pr });
  } catch (error: any) {
    console.error('Get PR error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Mettre à jour un PR
 */
export const updatePRController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pr = await updatePR(id, updateData);

    res.json({
      message: 'Record personnel mis à jour avec succès',
      pr,
    });
  } catch (error: any) {
    console.error('Update PR error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Supprimer un PR
 */
export const deletePRController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deletePR(id);

    res.json({
      message: 'Record personnel supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete PR error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
