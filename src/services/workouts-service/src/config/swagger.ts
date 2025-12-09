import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BodyGoal Workouts Service API',
      version: '1.0.0',
      description: 'Service de gestion des sessions d\'entraînement',
      contact: {
        name: 'BodyGoal Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api/workouts',
        description: 'Via API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token Firebase obtenu après connexion',
        },
      },
    },
    tags: [
      {
        name: 'Workouts',
        description: 'Gestion des sessions d\'entraînement',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
