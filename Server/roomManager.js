/**
 * In-Memory Room Manager
 * Manages active rooms and connected users in memory.
 *
 * Data Structure:
 * rooms = {
 *   [roomId]: {
 *     id: string,
 *     createdAt: number,
 *     users: [
 *       { socketId: string, name: string, joinedAt: number }
 *     ]
 *   }
 * }
 */

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Check if a room exists
   */
  hasRoom(roomId) {
    return this.rooms.has(roomId);
  }

  /**
   * Create a new room
   */
  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        createdAt: Date.now(),
        users: []
      });
      console.log(`[RoomManager] Room created: "${roomId}"`);
    }
    return this.rooms.get(roomId);
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Add a user to a room
   */
  addUser(roomId, socketId, name) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if user with this socketId is already in the room
    const existingIndex = room.users.findIndex((u) => u.socketId === socketId);
    const user = {
      socketId,
      name: name || 'Anonymous',
      joinedAt: Date.now()
    };

    if (existingIndex >= 0) {
      room.users[existingIndex] = user;
    } else {
      room.users.push(user);
    }

    console.log(`[RoomManager] User "${user.name}" (${socketId}) added to room "${roomId}". Total users: ${room.users.length}`);
    return user;
  }

  /**
   * Remove a user from a specific room
   */
  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const userIndex = room.users.findIndex((u) => u.socketId === socketId);
    if (userIndex === -1) return null;

    const [removedUser] = room.users.splice(userIndex, 1);
    console.log(`[RoomManager] User "${removedUser.name}" left room "${roomId}". Remaining: ${room.users.length}`);

    // If room is empty, clean it up
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room "${roomId}" is empty and was removed.`);
    }

    return removedUser;
  }

  /**
   * Get all users in a room
   */
  getUsers(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.users : [];
  }

  /**
   * Find which room a socket currently belongs to
   */
  findRoomBySocketId(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      const user = room.users.find((u) => u.socketId === socketId);
      if (user) {
        return { roomId, user };
      }
    }
    return null;
  }

  /**
   * Remove a user from any room they might be in (useful on disconnect)
   */
  removeUserFromAllRooms(socketId) {
    const result = [];
    for (const [roomId, room] of this.rooms.entries()) {
      const userIndex = room.users.findIndex((u) => u.socketId === socketId);
      if (userIndex !== -1) {
        const [removedUser] = room.users.splice(userIndex, 1);
        result.push({ roomId, removedUser, remainingUsers: room.users });

        if (room.users.length === 0) {
          this.rooms.delete(roomId);
          console.log(`[RoomManager] Room "${roomId}" removed after last user disconnected.`);
        }
      }
    }
    return result;
  }

  /**
   * End a room completely
   */
  endRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    this.rooms.delete(roomId);
    console.log(`[RoomManager] Room "${roomId}" was ended.`);
    return room;
  }
}

export const roomManager = new RoomManager();
