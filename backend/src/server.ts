/**
 * TaskPilot API Server
 *
 * Main entry point for the backend server. Sets up Express, Socket.io, middleware, routes, and error handling.
 * Handles HTTP and WebSocket connections, CORS, rate limiting, and graceful shutdown.
 */
// Core dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// API route modules
import authRoutes from './routes/authRoutes'; // Auth endpoints (login, register, etc)
import taskRoutes from './routes/taskRoutes'; // Task CRUD endpoints
import optionRoutes from './routes/optionRoutes'; // Status/project option endpoints
import groceryRoutes from './routes/groceryRoutes';
import groceryCategoryRoutes from './routes/groceryCategoryRoutes';
import recipeRoutes from './routes/recipeRoutes';
import recipeCategoryRoutes from './routes/recipeCategoryRoutes';

// Error handling middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables from .env file
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']; // Allowed CORS origins

/**
 * Socket.io setup for real-time communication
 * Allows frontend clients to connect for live updates (tasks, options, etc)
 */
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

// Attach Socket.io instance to Express app for access in routes/controllers
app.set('io', io);

// Security and parsing middleware
app.use(helmet()); // Sets security-related HTTP headers
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting to prevent abuse. Enabled only in production to avoid blocking local development.
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
} else {
  // In development, either skip or use a very permissive limiter to avoid 429 during testing.
  const devLimiter = rateLimit({ windowMs: 60 * 1000, max: 1000 });
  app.use('/api/', devLimiter);
}

// API routes
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'TaskPilot API Server',
    version: '1.0.0',
  });
});
app.use('/api/auth', authRoutes); // Auth endpoints
app.use('/api/tasks', taskRoutes); // Task endpoints
app.use('/api/options', optionRoutes); // Status/project option endpoints
app.use('/api/groceries', groceryRoutes); // Grocery CRUD endpoints
app.use('/api/grocery-categories', groceryCategoryRoutes); // Grocery-specific categories
app.use('/api/recipes', recipeRoutes);
app.use('/api/recipe-categories', recipeCategoryRoutes);

// Error handling middleware (404 and general errors)
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Handle Socket.io connections
 * - Logs connection/disconnection
 * - Allows users to join their own room for private updates
 */
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start HTTP and WebSocket server
httpServer.listen(PORT, () => {
  console.log(`🚀 TaskPilot API server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Export Socket.io instance for use in other modules
export { io };
