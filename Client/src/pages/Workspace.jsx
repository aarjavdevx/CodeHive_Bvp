import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../socket/socket.js';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import HomeScreen from './HomeScreen.jsx';
import RoomScreen from './RoomScreen.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Workspace() {
  const auth = useAuth?.() || {};
  const loggedInUser = auth.user;

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || '');
  const [logs, setLogs] = useState([]);

  // Active workspace room state
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to append a timestamped log entry
  const addLog = useCallback((event, message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
    setLogs((prev) => [{ time, event, message, type }, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    // 1. Connection established
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
      addLog('connect', `Established WebSocket connection (socket.id: ${socket.id})`, 'success');
    }

    // 2. Server welcome message
    function onConnectionSuccess(data) {
      addLog('connection-success', data.message, 'success');
    }

    // 3. Disconnection
    function onDisconnect(reason) {
      setIsConnected(false);
      setSocketId('');
      addLog('disconnect', `Disconnected from server: ${reason}`, 'warning');
    }

    // 4. Connection error
    function onConnectError(error) {
      setIsConnected(false);
      addLog('connect_error', `Connection failed: ${error.message}`, 'error');
    }

    // 5. Room created acknowledgment
    function onRoomCreated(data) {
      setCurrentRoomId(data.roomId);
      setCurrentUser(data.user);
      setRoomUsers(data.users || [data.user]);
      setErrorMessage('');
      addLog('room-created', `Room "${data.roomId}" created successfully`, 'success');
    }

    // 6. Updated users in current room
    function onRoomUsers(data) {
      if (data.roomId === currentRoomId || !currentRoomId) {
        setRoomUsers(data.users);
        addLog('room-users', `Updated room users (${data.users.length} active)`, 'info');
      }
    }

    // 7. Room error
    function onRoomError(data) {
      setErrorMessage(data.message);
      addLog('room-error', data.message, 'error');
    }

    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('connection-success', onConnectionSuccess);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room-created', onRoomCreated);
    socket.on('room-users', onRoomUsers);
    socket.on('room-error', onRoomError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connection-success', onConnectionSuccess);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-created', onRoomCreated);
      socket.off('room-users', onRoomUsers);
      socket.off('room-error', onRoomError);
    };
  }, [addLog, currentRoomId]);

  // Handle Create Room
  const handleCreateRoom = (roomId, userName) => {
    setErrorMessage('');
    const finalUserName = userName || loggedInUser?.name || 'Anonymous';
    addLog('create-room', `Requesting creation of room "${roomId}" as "${finalUserName}"`, 'info');
    socket.emit('create-room', { roomId, userName: finalUserName });
  };

  // Toggle connection manually
  const handleToggleConnection = () => {
    if (socket.connected) {
      socket.disconnect();
    } else {
      socket.connect();
    }
  };

  // Temporary local leave for Step 3
  const handleLeaveRoom = () => {
    addLog('leave-room', `Left workspace "${currentRoomId}"`, 'warning');
    setCurrentRoomId(null);
    setCurrentUser(null);
    setRoomUsers([]);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-badge">⚡</div>
          <div>
            <h1 className="logo-title">CodeHive</h1>
            <p className="logo-subtitle">Real-Time Collaborative Workspace</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Auth Navigation Links */}
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
            {loggedInUser ? (
              <Link to="/profile" style={{ color: '#93c5fd', textDecoration: 'none' }}>
                👤 {loggedInUser.name || loggedInUser.email || 'Profile'}
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ color: '#9aa5b8', textDecoration: 'none' }}>
                  Login
                </Link>
                <span style={{ color: '#626d82' }}>|</span>
                <Link to="/signup" style={{ color: '#9aa5b8', textDecoration: 'none' }}>
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Live Socket.IO Status Badge */}
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
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage('')}
          />
        ) : (
          <RoomScreen
            roomId={currentRoomId}
            currentUser={currentUser}
            users={roomUsers}
            isConnected={isConnected}
            onLeaveRoom={handleLeaveRoom}
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>
    </div>
  );
}
