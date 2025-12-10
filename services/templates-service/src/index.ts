import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import templatesRoutes from './routes/templates.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logs HTTP
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Templates Service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/', templatesRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n📋 Templates Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`\n`);
});
