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
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api', router);

// Socket.io setup
setupSocket(httpServer);

// Error handling (must be last)
app.use(errorMiddleware);

// Start server
httpServer.listen(env.PORT, () => {
  logger.info(`🚀 API server running on port ${env.PORT}`);
  logger.info(`🔌 Socket.io server ready`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 CORS origin: ${env.CORS_ORIGIN}`);
});

export { app, io };
