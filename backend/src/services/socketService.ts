/**
 * Socket Service
 *
 * Helper functions for emitting WebSocket events to clients.
 * Supports user-specific rooms and broadcast to all connected clients.
 * Used for real-time updates of tasks, options, and other entities.
 */
import { Server } from 'socket.io';
import { SocketEvent } from '../types';

/**
 * Emits a socket event to a specific user's room.
 * Clients join rooms with the format 'user:{userId}' on connection.
 * @param io - Socket.IO server instance
 * @param userId - User ID to target
 * @param event - Socket event type (e.g., TASK_CREATED)
 * @param data - Event payload
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
 * Emits a socket event to all connected clients (broadcast).
 * Use sparingly; prefer user-specific rooms for most operations.
 * @param io - Socket.IO server instance
 * @param event - Socket event type
 * @param data - Event payload
 */
export const emitToAll = (
  io: Server,
  event: SocketEvent,
  data: any
): void => {
  io.emit(event, data);
};
