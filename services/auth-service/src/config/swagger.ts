import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BodyGoal Auth Service API',
      version: '1.0.0',
      description: 'Service d\'authentification et gestion des profils utilisateurs',
      contact: {
        name: 'BodyGoal Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api/auth',
        description: 'API Gateway',
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
        name: 'Auth',
        description: 'Endpoints d\'authentification et gestion de profil',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
