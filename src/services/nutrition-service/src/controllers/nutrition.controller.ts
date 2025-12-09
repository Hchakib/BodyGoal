import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createNutritionEntry,
  getNutritionEntries,
  deleteNutritionEntry,
  getNutritionGoals,
  updateNutritionGoals,
  getNutritionStats,
} from '../services/nutrition.service';

/**
 * Créer une nouvelle entrée de repas
 */
export const createMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const entryData = req.body;

    const result = await createNutritionEntry(userId, entryData);

    res.status(201).json({
      message: 'Repas ajouté avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create meal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer les repas
 */
export const getMealsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const meals = await getNutritionEntries(userId, start, end);

    res.json({
      count: meals.length,
      meals,
    });
  } catch (error: any) {
    console.error('Get meals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Supprimer un repas
 */
export const deleteMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await deleteNutritionEntry(userId, id);

    res.json({
      message: 'Repas supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer les objectifs nutritionnels
 */
export const getGoalsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const goals = await getNutritionGoals(userId);

    res.json({ goals });
  } catch (error: any) {
    console.error('Get goals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Mettre à jour les objectifs nutritionnels
 */
export const updateGoalsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goalsData = req.body;

    const goals = await updateNutritionGoals(userId, goalsData);

    res.json({
      message: 'Objectifs nutritionnels mis à jour avec succès',
      goals,
    });
  } catch (error: any) {
    console.error('Update goals error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer les statistiques nutritionnelles
 */
export const getStatsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const stats = await getNutritionStats(userId, start, end);

    res.json({ stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
