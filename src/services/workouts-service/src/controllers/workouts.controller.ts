import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
} from '../services/workouts.service';

/**
 * Créer une nouvelle session d'entraînement
 */
export const createWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const workoutData = req.body;

    const result = await createWorkout(userId, workoutData);

    res.status(201).json({
      message: 'Workout créé avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer les workouts de l'utilisateur
 */
export const getWorkoutsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;

    const workouts = await getWorkouts(userId, limit);

    res.json({
      count: workouts.length,
      workouts,
    });
  } catch (error: any) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Récupérer un workout par ID
 */
export const getWorkoutByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const workout = await getWorkoutById(id);

    if (!workout) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Workout non trouvé',
      });
    }

    res.json({ workout });
  } catch (error: any) {
    console.error('Get workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Mettre à jour un workout
 */
export const updateWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const workout = await updateWorkout(id, updateData);

    res.json({
      message: 'Workout mis à jour avec succès',
      workout,
    });
  } catch (error: any) {
    console.error('Update workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Supprimer un workout
 */
export const deleteWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteWorkout(id);

    res.json({
      message: 'Workout supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * Obtenir les statistiques des workouts
 */
export const getStatsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const stats = await getWorkoutStats(userId);

    res.json({ stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
