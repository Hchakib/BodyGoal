import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  scheduleWorkout,
  getScheduledWorkouts,
  completeScheduledWorkout,
  deleteScheduledWorkout,
} from '../services/templates.service';

// ============ TEMPLATES ============

export const createTemplateController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const templateData = req.body;

    const result = await createTemplate(userId, templateData);

    res.status(201).json({
      message: 'Template créé avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getTemplatesController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const templates = await getTemplates(userId);

    res.json({
      count: templates.length,
      templates,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getTemplateByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Template non trouvé',
      });
    }

    res.json({ template });
  } catch (error: any) {
    console.error('Get template error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const updateTemplateController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await updateTemplate(id, updateData);

    res.json({
      message: 'Template mis à jour avec succès',
      template,
    });
  } catch (error: any) {
    console.error('Update template error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const deleteTemplateController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteTemplate(id);

    res.json({
      message: 'Template supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete template error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

// ============ SCHEDULED WORKOUTS ============

export const scheduleWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const workoutData = req.body;

    const result = await scheduleWorkout(userId, workoutData);

    res.status(201).json({
      message: 'Workout planifié avec succès',
      ...result,
    });
  } catch (error: any) {
    console.error('Schedule workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const getScheduledWorkoutsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const workouts = await getScheduledWorkouts(userId);

    res.json({
      count: workouts.length,
      workouts,
    });
  } catch (error: any) {
    console.error('Get scheduled workouts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const completeScheduledWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const workout = await completeScheduledWorkout(id);

    res.json({
      message: 'Workout marqué comme complété',
      workout,
    });
  } catch (error: any) {
    console.error('Complete scheduled workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const deleteScheduledWorkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteScheduledWorkout(id);

    res.json({
      message: 'Workout planifié supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete scheduled workout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
