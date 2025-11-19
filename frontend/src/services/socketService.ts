/**
 * Socket Service
 * Manages the WebSocket connection to the backend using socket.io-client.
 * Provides methods to connect, disconnect, listen, emit, and check connection status.
 */
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  /**
   * Establishes a socket connection and joins a user-specific room.
   * @param userId The ID of the user to join the room for.
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Join user-specific room
      this.socket?.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  /**
   * Disconnects the socket connection and cleans up resources.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Registers an event listener for a socket event.
   * @param event The event name to listen for.
   * @param callback The callback to invoke when the event is received.
   */
  on(event: SocketEvent, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Removes an event listener for a socket event.
   * @param event The event name to remove the listener for.
   * @param callback Optional callback to remove a specific listener.
   */
  off(event: SocketEvent, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * Emits an event to the socket server.
   * @param event The event name to emit.
   * @param data Optional data to send with the event.
   */
  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  /**
   * Checks if the socket is currently connected.
   * @returns True if connected, false otherwise.
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
