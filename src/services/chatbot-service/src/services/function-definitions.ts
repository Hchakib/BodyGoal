/**
 * OpenAI Function Definitions
 * Ces définitions permettent au chatbot d'appeler des fonctions
 */

export const functionDefinitions = [
  {
    name: 'addPersonalRecord',
    description: 'Ajoute un nouveau Personal Record (PR) pour un exercice',
    parameters: {
      type: 'object',
      properties: {
        exerciseName: {
          type: 'string',
          description: 'Nom de l\'exercice (ex: Bench Press, Squat, Deadlift)',
        },
        weight: {
          type: 'number',
          description: 'Poids soulevé en kilogrammes',
        },
        reps: {
          type: 'number',
          description: 'Nombre de répétitions',
        },
        date: {
          type: 'string',
          description: 'Date du PR au format ISO (optionnel, utilise la date actuelle si non fourni)',
        },
      },
      required: ['exerciseName', 'weight', 'reps'],
    },
  },
  {
    name: 'scheduleWorkout',
    description: 'Planifie un workout pour une date spécifique',
    parameters: {
      type: 'object',
      properties: {
        templateName: {
          type: 'string',
          description: 'Nom du workout (ex: Push Day, Leg Day, Upper Body)',
        },
        date: {
          type: 'string',
          description: 'Date du workout au format ISO (YYYY-MM-DD)',
        },
        type: {
          type: 'string',
          enum: ['strength', 'cardio'],
          description: 'Type de workout',
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nom de l\'exercice',
              },
              sets: {
                type: 'number',
                description: 'Nombre de séries',
              },
              reps: {
                type: 'number',
                description: 'Répétitions par série (pour strength)',
              },
              duration: {
                type: 'number',
                description: 'Durée en minutes (pour cardio)',
              },
            },
          },
          description: 'Liste des exercices à inclure (optionnel, auto-suggéré si vide)',
        },
        notes: {
          type: 'string',
          description: 'Notes optionnelles pour le workout',
        },
      },
      required: ['templateName', 'date', 'type'],
    },
  },
  {
    name: 'updateProfile',
    description: 'Met à jour les informations du profil utilisateur',
    parameters: {
      type: 'object',
      properties: {
        weight: {
          type: 'number',
          description: 'Nouveau poids en kilogrammes',
        },
        height: {
          type: 'number',
          description: 'Nouvelle taille en centimètres',
        },
        age: {
          type: 'number',
          description: 'Âge de l\'utilisateur',
        },
        fitnessGoal: {
          type: 'string',
          enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance'],
          description: 'Nouvel objectif fitness',
        },
        displayName: {
          type: 'string',
          description: 'Nouveau nom d\'affichage',
        },
        bio: {
          type: 'string',
          description: 'Biographie ou description personnelle',
        },
        weeklyGoal: {
          type: 'number',
          description: 'Nombre de workouts souhaités par semaine',
        },
      },
    },
  },
  {
    name: 'getProfile',
    description: 'Affiche toutes les informations du profil utilisateur',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getWorkoutStats',
    description: 'Récupère les statistiques détaillées des workouts',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['week', 'month', 'all'],
          description: 'Période à analyser',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'addMeal',
    description: 'Ajoute un repas avec ses valeurs nutritionnelles',
    parameters: {
      type: 'object',
      properties: {
        mealName: {
          type: 'string',
          description: 'Nom du repas ou aliment (ex: Poulet grillé, Riz basmati, Banane)',
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          description: 'Type de repas',
        },
        calories: {
          type: 'number',
          description: 'Calories totales en kcal',
        },
        protein: {
          type: 'number',
          description: 'Protéines en grammes',
        },
        carbs: {
          type: 'number',
          description: 'Glucides en grammes',
        },
        fats: {
          type: 'number',
          description: 'Lipides en grammes',
        },
        fiber: {
          type: 'number',
          description: 'Fibres en grammes (optionnel)',
        },
      },
      required: ['mealName', 'mealType', 'calories', 'protein', 'carbs', 'fats'],
    },
  },
  {
    name: 'getNutritionStats',
    description: 'Récupère les statistiques détaillées de la consommation nutritionnelle',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'week', 'month'],
          description: 'Période à analyser',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'updateNutritionGoals',
    description: 'Met à jour les objectifs nutritionnels de l\'utilisateur',
    parameters: {
      type: 'object',
      properties: {
        calories: {
          type: 'number',
          description: 'Objectif calorique en kcal',
        },
        protein: {
          type: 'number',
          description: 'Objectif en protéines en grammes',
        },
        carbs: {
          type: 'number',
          description: 'Objectif en glucides en grammes',
        },
        fats: {
          type: 'number',
          description: 'Objectif en lipides en grammes',
        },
      },
    },
  },
  {
    name: 'createWorkoutTemplate',
    description: 'Crée un template de workout personnalisé',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nom du template (ex: Push Day, Full Body)',
        },
        type: {
          type: 'string',
          enum: ['strength', 'cardio'],
          description: 'Type de workout',
        },
        description: {
          type: 'string',
          description: 'Description optionnelle',
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              sets: { type: 'number' },
              reps: { type: 'number' },
              weight: { type: 'number' },
              duration: { type: 'number' },
              notes: { type: 'string' },
            },
            required: ['name'],
          },
          description: 'Liste des exercices du template',
        },
      },
      required: ['name', 'type', 'exercises'],
    },
  },
];
