import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logs HTTP simples
app.use(express.json());

// Forward the parsed JSON body to downstream services so POST/PUT payloads are preserved
const forwardBody = (proxyReq: any, req: Request) => {
  if (!req.body || Object.keys(req.body).length === 0) return;
  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
};

// Health check de l'API Gateway
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route d'information
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'BodyGoal API Gateway',
    version: '1.0.0',
    description: 'API Gateway pour architecture microservices',
    endpoints: {
      auth: '/api/auth',
      workouts: '/api/workouts',
      nutrition: '/api/nutrition',
      pr: '/api/pr',
      templates: '/api/templates',
      chatbot: '/api/chatbot',
    },
    documentation: {
      auth: `${process.env.AUTH_SERVICE_URL}/api-docs`,
      workouts: `${process.env.WORKOUTS_SERVICE_URL}/api-docs`,
    },
  });
});

// Proxy vers Auth Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (Auth Service):', err.message);
      (res as Response).status(503).json({
        error: 'Auth Service unavailable',
        message: err.message,
      });
    },
  })
);

// Proxy vers Workouts Service
app.use(
  '/api/workouts',
  createProxyMiddleware({
    target: process.env.WORKOUTS_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/workouts': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (Workouts Service):', err.message);
      (res as Response).status(503).json({
        error: 'Workouts Service unavailable',
        message: err.message,
      });
    },
  })
);

// Proxy vers Nutrition Service
app.use(
  '/api/nutrition',
  createProxyMiddleware({
    target: process.env.NUTRITION_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/api/nutrition': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (Nutrition Service):', err.message);
      (res as Response).status(503).json({
        error: 'Nutrition Service unavailable',
        message: err.message,
      });
    },
  })
);

// Proxy vers Personal Records Service
app.use(
  '/api/pr',
  createProxyMiddleware({
    target: process.env.PR_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: { '^/api/pr': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (PR Service):', err.message);
      (res as Response).status(503).json({
        error: 'PR Service unavailable',
        message: err.message,
      });
    },
  })
);

// Proxy vers Templates Service
app.use(
  '/api/templates',
  createProxyMiddleware({
    target: process.env.TEMPLATES_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^/api/templates': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (Templates Service):', err.message);
      (res as Response).status(503).json({
        error: 'Templates Service unavailable',
        message: err.message,
      });
    },
  })
);

// Proxy vers Chatbot Service
app.use(
  '/api/chatbot',
  createProxyMiddleware({
    target: process.env.CHATBOT_SERVICE_URL || 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: { '^/api/chatbot': '' },
    onProxyReq: forwardBody,
    onError: (err, req, res) => {
      console.error('Proxy error (Chatbot Service):', err.message);
      (res as Response).status(503).json({
        error: 'Chatbot Service unavailable',
        message: err.message,
      });
    },
  })
);

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/workouts',
      '/api/nutrition',
      '/api/pr',
      '/api/templates',
      '/api/chatbot',
    ],
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proxying to:`);
  console.log(`   Auth Service:      ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   Workouts Service:  ${process.env.WORKOUTS_SERVICE_URL}`);
  console.log(`   Nutrition Service: ${process.env.NUTRITION_SERVICE_URL}`);
  console.log(`   PR Service:        ${process.env.PR_SERVICE_URL}`);
  console.log(`   Templates Service: ${process.env.TEMPLATES_SERVICE_URL}`);
  console.log(`   Chatbot Service:   ${process.env.CHATBOT_SERVICE_URL}`);
});
