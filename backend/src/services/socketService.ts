// Helper function to emit socket events for task updates
import { Server } from 'socket.io';
import { SocketEvent } from '../types';

/**
 * Emit a socket event to a specific user's room
 */
export const emitToUser = (
  io: Server,
  userId: string,
  event: SocketEvent,
  data: any
): void => {
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit a socket event to all connected clients
 */
export const emitToAll = (
  io: Server,
  event: SocketEvent,
  data: any
): void => {
  io.emit(event, data);
};
