import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import chatbotRoutes from './routes/chatbot.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logs HTTP
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Chatbot Service',
    timestamp: new Date().toISOString(),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
});

// Routes
app.use('/', chatbotRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n🤖 Chatbot Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log(`\n`);
});
