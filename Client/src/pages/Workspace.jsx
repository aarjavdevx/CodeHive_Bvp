import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../socket/socket.js';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import HomeScreen from './HomeScreen.jsx';
import RoomScreen from './RoomScreen.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Workspace() {
  const auth = useAuth?.() || {};
  const loggedInUser = auth.user;

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || '');

  // Room state
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // In-room chat messages
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // 1. Socket transport lifecycle
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      setSocketId('');
    }

    // 2. Room created acknowledgment
    function onRoomCreated(data) {
      setCurrentRoomId(data.roomId);
      setCurrentUser(data.user);
      setRoomUsers(data.users || [data.user]);
      setChatMessages([]);
      setErrorMessage('');
    }

    // 3. Room joined acknowledgment
    function onRoomJoined(data) {
      setCurrentRoomId(data.roomId);
      setCurrentUser(data.user);
      setRoomUsers(data.users || [data.user]);
      setChatMessages([]);
      setErrorMessage('');
    }

    // 4. Room users updated
    function onRoomUsers(data) {
      setRoomUsers(data.users || []);
    }

    // 5. Notification: Another user joined
    function onUserJoined(data) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}-${Math.random()}`,
          sender: { name: 'System', socketId: 'sys' },
          text: `👋 ${data.user.name} joined the workspace`,
          timestamp: Date.now(),
          isSystem: true
        }
      ]);
    }

    // 6. Notification: A user left
    function onUserLeft(data) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}-${Math.random()}`,
          sender: { name: 'System', socketId: 'sys' },
          text: `🚪 ${data.user.name} left the workspace`,
          timestamp: Date.now(),
          isSystem: true
        }
      ]);
    }

    // 7. Left room confirmation
    function onLeftRoom() {
      setCurrentRoomId(null);
      setCurrentUser(null);
      setRoomUsers([]);
      setChatMessages([]);
    }

    // 8. Room ended by host
    function onRoomEnded(data) {
      alert(data.message || 'Workspace room was closed.');
      setCurrentRoomId(null);
      setCurrentUser(null);
      setRoomUsers([]);
      setChatMessages([]);
    }

    // 9. Room error
    function onRoomError(data) {
      setErrorMessage(data.message);
    }

    // 10. Incoming in-room chat message
    function onChatMessage(data) {
      setChatMessages((prev) => [...prev, data]);
    }

    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('room-users', onRoomUsers);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('left-room', onLeftRoom);
    socket.on('room-ended', onRoomEnded);
    socket.on('room-error', onRoomError);
    socket.on('chat-message', onChatMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('room-users', onRoomUsers);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('left-room', onLeftRoom);
      socket.off('room-ended', onRoomEnded);
      socket.off('room-error', onRoomError);
      socket.off('chat-message', onChatMessage);
    };
  }, []);

  // Action: Create Room
  const handleCreateRoom = (roomId, userName) => {
    setErrorMessage('');
    const finalName = userName || loggedInUser?.name || 'Anonymous';
    socket.emit('create-room', { roomId, userName: finalName });
  };

  // Action: Join Room
  const handleJoinRoom = (roomId, userName) => {
    setErrorMessage('');
    const finalName = userName || loggedInUser?.name || 'Anonymous';
    socket.emit('join-room', { roomId, userName: finalName });
  };

  // Action: Leave Room
  const handleLeaveRoom = () => {
    if (!currentRoomId) return;
    socket.emit('leave-room', { roomId: currentRoomId });
    setCurrentRoomId(null);
    setCurrentUser(null);
    setRoomUsers([]);
    setChatMessages([]);
  };

  // Action: End Room
  const handleEndRoom = () => {
    if (!currentRoomId) return;
    if (window.confirm(`Are you sure you want to end room "${currentRoomId}" for all users?`)) {
      socket.emit('end-room', { roomId: currentRoomId });
      setCurrentRoomId(null);
      setCurrentUser(null);
      setRoomUsers([]);
      setChatMessages([]);
    }
  };

  // Action: Send Chat Message
  const handleSendChatMessage = (text) => {
    if (!currentRoomId || !text.trim()) return;
    socket.emit('send-chat-message', {
      roomId: currentRoomId,
      text: text.trim()
    });
  };

  // Toggle connection manually
  const handleToggleConnection = () => {
    if (socket.connected) {
      socket.disconnect();
    } else {
      socket.connect();
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-badge">⚡</div>
          <div>
            <h1 className="logo-title">CodeHive</h1>
            <p className="logo-subtitle">Collaborative Workspace</p>
          </div>
        </div>

        <div className="header-controls">
          {/* Teammate Auth Navigation Links */}
          <div className="auth-links">
            {loggedInUser ? (
              <Link to="/profile" className="auth-link-profile">
                👤 {loggedInUser.name || loggedInUser.email || 'Profile'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="auth-link">
                  Login
                </Link>
                <span className="auth-divider">|</span>
                <Link to="/signup" className="auth-link">
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Light / Dark Theme Button */}
          <ThemeToggle />

          {/* Socket Connection Badge */}
          <ConnectionStatus
            isConnected={isConnected}
            socketId={socketId}
            onToggleConnect={handleToggleConnection}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {!currentRoomId ? (
          <HomeScreen
            isConnected={isConnected}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage('')}
            initialUserName={loggedInUser?.name || ''}
          />
        ) : (
          <RoomScreen
            roomId={currentRoomId}
            currentUser={currentUser}
            users={roomUsers}
            isConnected={isConnected}
            onLeaveRoom={handleLeaveRoom}
            onEndRoom={handleEndRoom}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
          />
        )}
      </main>
    </div>
  );
}
