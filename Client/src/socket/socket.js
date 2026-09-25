import { io } from 'socket.io-client';

// Backend server URL (defaults to localhost:5000)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * Shared Socket.IO client instance.
 * - autoConnect: true initiates connection immediately.
 * - transports: ['websocket', 'polling'] prefers direct WebSocket with fallback.
 */
export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
