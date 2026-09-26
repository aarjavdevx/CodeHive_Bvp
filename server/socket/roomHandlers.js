import { roomManager } from '../roomManager.js';

/**
 * Socket.IO Room Event Handlers
 * Registers client listeners for room creation, joining, leaving, and disconnects.
 */
export function registerRoomHandlers(io, socket) {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Emit connection acknowledgment directly to the newly connected client
  socket.emit('connection-success', {
    socketId: socket.id,
    message: 'Connected to CodeHive Socket.IO server',
    timestamp: Date.now()
  });

  /**
   * 1. CREATE ROOM
   * Client emits: 'create-room', { roomId, userName }
   */
  socket.on('create-room', ({ roomId, userName }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      const cleanUserName = (userName || '').trim() || 'Anonymous';

      if (!cleanRoomId) {
        socket.emit('room-error', { message: 'Room ID is required to create a workspace.' });
        return;
      }

      // Check if room already exists
      if (roomManager.hasRoom(cleanRoomId)) {
        socket.emit('room-error', { message: `Room "${cleanRoomId}" already exists. Please choose a different ID or join it.` });
        return;
      }

      // Create room in in-memory store
      roomManager.createRoom(cleanRoomId);

      // Add user to the room state
      const user = roomManager.addUser(cleanRoomId, socket.id, cleanUserName);

      // Join the Socket.IO channel for this room
      socket.join(cleanRoomId);

      console.log(`[Socket.IO] Room "${cleanRoomId}" created by ${cleanUserName} (${socket.id})`);

      // Acknowledge creator with 'room-created'
      socket.emit('room-created', {
        roomId: cleanRoomId,
        user,
        users: roomManager.getUsers(cleanRoomId),
        message: `Workspace "${cleanRoomId}" created successfully!`
      });

      // Broadcast updated user list to everyone in the room
      io.to(cleanRoomId).emit('room-users', {
        roomId: cleanRoomId,
        users: roomManager.getUsers(cleanRoomId)
      });
    } catch (error) {
      console.error('[Socket.IO] Error creating room:', error);
      socket.emit('room-error', { message: 'Failed to create room on server.' });
    }
  });

  /**
   * Handle unexpected socket disconnect (closing browser, network loss)
   */
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);

    // Remove user from any rooms they were registered in
    const departures = roomManager.removeUserFromAllRooms(socket.id);
    for (const { roomId, removedUser, remainingUsers } of departures) {
      // Notify remaining users in that specific room
      io.to(roomId).emit('user-left', {
        user: removedUser,
        message: `${removedUser.name} disconnected`
      });

      io.to(roomId).emit('room-users', {
        roomId,
        users: remainingUsers
      });
    }
  });
}
