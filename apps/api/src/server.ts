// MUST be first import to load environment variables before any other module
import './env-loader';

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import { router } from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { setupSocket } from './socket';
import { logger } from './utils/logger';
import { env } from './config/env';

const app = express();
const httpServer = createServer(app);

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://iarpg-web.vercel.app',
];

// Add custom origin from env if provided
if (env.CORS_ORIGIN) {
  allowedOrigins.push(env.CORS_ORIGIN);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Check if origin is in whitelist or matches Vercel pattern
    if (allowedOrigins.includes(origin) || (origin && origin.includes('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api', router);

// Socket.io setup
const io = setupSocket(httpServer);

// Error handling (must be last)
app.use(errorMiddleware);

// Start server
httpServer.listen(env.PORT, () => {
  logger.info(`🚀 API server running on port ${env.PORT}`);
  logger.info(`🔌 Socket.io server ready`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

export { app, io };
