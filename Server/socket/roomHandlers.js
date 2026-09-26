import { roomManager } from '../roomManager.js';

/**
 * Socket.IO Workspace Room and Chat Event Handlers
 */
export function registerRoomHandlers(io, socket) {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Emit connection acknowledgment
  socket.emit('connection-success', {
    socketId: socket.id,
    message: 'Connected to CodeHive server',
    timestamp: Date.now()
  });

  /**
   * 1. CREATE ROOM
   */
  socket.on('create-room', ({ roomId, userName }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      const cleanUserName = (userName || '').trim() || 'Anonymous';

      if (!cleanRoomId) {
        socket.emit('room-error', { message: 'Room ID is required to create a workspace.' });
        return;
      }

      if (roomManager.hasRoom(cleanRoomId)) {
        socket.emit('room-error', { message: `Room "${cleanRoomId}" already exists. Join it instead.` });
        return;
      }

      roomManager.createRoom(cleanRoomId);
      const user = roomManager.addUser(cleanRoomId, socket.id, cleanUserName);
      socket.join(cleanRoomId);

      console.log(`[Socket.IO] Room "${cleanRoomId}" created by ${cleanUserName} (${socket.id})`);

      socket.emit('room-created', {
        roomId: cleanRoomId,
        user,
        users: roomManager.getUsers(cleanRoomId)
      });

      io.to(cleanRoomId).emit('room-users', {
        roomId: cleanRoomId,
        users: roomManager.getUsers(cleanRoomId)
      });
    } catch (error) {
      console.error('[Socket.IO] Error creating room:', error);
      socket.emit('room-error', { message: 'Failed to create room.' });
    }
  });

  /**
   * 2. JOIN ROOM
   */
  socket.on('join-room', ({ roomId, userName }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      const cleanUserName = (userName || '').trim() || 'Anonymous';

      if (!cleanRoomId) {
        socket.emit('room-error', { message: 'Room ID is required to join.' });
        return;
      }

      if (!roomManager.hasRoom(cleanRoomId)) {
        socket.emit('room-error', { message: `Room "${cleanRoomId}" does not exist. Please check the ID or create it.` });
        return;
      }

      const user = roomManager.addUser(cleanRoomId, socket.id, cleanUserName);
      socket.join(cleanRoomId);

      console.log(`[Socket.IO] User ${cleanUserName} (${socket.id}) joined room "${cleanRoomId}"`);

      // Send confirmation to the joining user
      socket.emit('room-joined', {
        roomId: cleanRoomId,
        user,
        users: roomManager.getUsers(cleanRoomId)
      });

      // Notify other users in the room
      socket.to(cleanRoomId).emit('user-joined', {
        user,
        message: `${cleanUserName} joined the room`
      });

      // Synchronize full user list across room
      io.to(cleanRoomId).emit('room-users', {
        roomId: cleanRoomId,
        users: roomManager.getUsers(cleanRoomId)
      });
    } catch (error) {
      console.error('[Socket.IO] Error joining room:', error);
      socket.emit('room-error', { message: 'Failed to join room.' });
    }
  });

  /**
   * 3. LEAVE ROOM
   */
  socket.on('leave-room', ({ roomId }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      const removedUser = roomManager.removeUser(cleanRoomId, socket.id);
      socket.leave(cleanRoomId);

      socket.emit('left-room', { roomId: cleanRoomId });

      if (removedUser) {
        socket.to(cleanRoomId).emit('user-left', {
          user: removedUser,
          message: `${removedUser.name} left the room`
        });

        io.to(cleanRoomId).emit('room-users', {
          roomId: cleanRoomId,
          users: roomManager.getUsers(cleanRoomId)
        });
      }
    } catch (error) {
      console.error('[Socket.IO] Error leaving room:', error);
    }
  });

  /**
   * 4. END ROOM (Closes room for all participants)
   */
  socket.on('end-room', ({ roomId }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      roomManager.endRoom(cleanRoomId);

      io.to(cleanRoomId).emit('room-ended', {
        roomId: cleanRoomId,
        message: 'This workspace room was closed by the host.'
      });

      // Have all sockets leave this channel
      io.in(cleanRoomId).socketsLeave(cleanRoomId);
    } catch (error) {
      console.error('[Socket.IO] Error ending room:', error);
    }
  });

  /**
   * 5. IN-ROOM CHAT MESSAGE
   * Room-isolated communication: only emitted to sockets in this specific roomId
   */
  socket.on('send-chat-message', ({ roomId, text }) => {
    try {
      const cleanRoomId = (roomId || '').trim().toLowerCase();
      const cleanText = (text || '').trim();

      if (!cleanText || !cleanRoomId) return;

      const room = roomManager.getRoom(cleanRoomId);
      const user = room?.users.find((u) => u.socketId === socket.id);

      const messagePayload = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        roomId: cleanRoomId,
        sender: {
          socketId: socket.id,
          name: user ? user.name : 'Anonymous'
        },
        text: cleanText,
        timestamp: Date.now()
      };

      // Broadcast exclusively to members in this room
      io.to(cleanRoomId).emit('chat-message', messagePayload);
    } catch (error) {
      console.error('[Socket.IO] Error sending chat message:', error);
    }
  });

  /**
   * 6. DISCONNECT LIFECYCLE
   */
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);

    const departures = roomManager.removeUserFromAllRooms(socket.id);
    for (const { roomId, removedUser, remainingUsers } of departures) {
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
