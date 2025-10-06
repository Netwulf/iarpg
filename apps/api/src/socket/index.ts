import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { supabase } from '@iarpg/db';

// Store io instance to be accessed by other modules
let ioInstance: SocketIOServer | null = null;

// Track user disconnect timeouts to implement 30s grace period
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

export function setupSocket(httpServer: HTTPServer) {
  // Allow multiple origins for flexibility
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://iarpg-web.vercel.app',
    'https://iarpg-98aq3zzk5-tays-projects-cdc23402.vercel.app', // Preview deployments
  ];

  // Add custom origin from env if provided
  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
  }

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Check if origin is in whitelist or matches Vercel pattern
        if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
    },
  });

  // Store the instance
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join table room
    socket.on('table:join', ({ tableId }: { tableId: string }) => {
      socket.join(`table:${tableId}`);
      console.log(`Socket ${socket.id} joined table:${tableId}`);

      // Notify other members
      socket.to(`table:${tableId}`).emit('table:member-joined', {
        username: socket.data.username || 'User',
      });
    });

    // Leave table room
    socket.on('table:leave', ({ tableId }: { tableId: string }) => {
      socket.leave(`table:${tableId}`);
      console.log(`Socket ${socket.id} left table:${tableId}`);

      // Notify other members
      socket.to(`table:${tableId}`).emit('table:member-left', {
        username: socket.data.username || 'User',
      });
    });

    // User comes online
    socket.on('user:online', async ({ userId }: { userId: string }) => {
      console.log(`User online: ${userId}`);

      // Store userId in socket data
      socket.data.userId = userId;

      // Clear any pending disconnect timeout
      const timeout = disconnectTimeouts.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        disconnectTimeouts.delete(userId);
      }

      // Update user status in database
      await (supabase
        .from('users') as any)
        .update({
          online_status: 'online',
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Broadcast to all rooms user is in
      socket.rooms.forEach((room) => {
        if (room.startsWith('table:')) {
          socket.to(room).emit('presence:update', {
            userId,
            status: 'online',
          });
        }
      });
    });

    // Typing indicators
    socket.on('typing:start', ({ tableId }: { tableId: string }) => {
      socket.to(`table:${tableId}`).emit('typing:start', {
        userId: socket.data.userId,
        username: socket.data.username || 'User',
      });
    });

    socket.on('typing:stop', ({ tableId }: { tableId: string }) => {
      socket.to(`table:${tableId}`).emit('typing:stop', {
        userId: socket.data.userId,
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const userId = socket.data.userId;

      if (!userId) return;

      // Set a 30-second timeout before marking user as offline
      // This handles brief disconnections (page refresh, network hiccup)
      const timeout = setTimeout(async () => {
        console.log(`User went offline after timeout: ${userId}`);

        // Update user status in database
        await (supabase
          .from('users') as any)
          .update({
            online_status: 'offline',
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Broadcast to all rooms user was in
        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
          if (room.startsWith('table:')) {
            io.to(room).emit('presence:update', {
              userId,
              status: 'offline',
            });
          }
        });

        // Remove from timeout tracking
        disconnectTimeouts.delete(userId);
      }, 30000); // 30 seconds

      // Store timeout so it can be cancelled if user reconnects
      disconnectTimeouts.set(userId, timeout);
    });
  });

  return io;
}

// Export getter for io instance
export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call setupSocket first.');
  }
  return ioInstance;
}
