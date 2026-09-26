import { useState } from 'react';
import ChatBox from '../components/ChatBox.jsx';

/**
 * RoomScreen Component
 * Workspace room interface featuring:
 * - Top workspace control bar (Leave / End room)
 * - Blank space for Monaco Editor & collaborative features
 * - Connected Users panel
 * - In-Room Live ChatBox (replaces the raw socket log)
 */
export default function RoomScreen({
  roomId,
  currentUser,
  users = [],
  isConnected,
  onLeaveRoom,
  onEndRoom,
  chatMessages = [],
  onSendChatMessage
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-screen-layout">
      {/* Top Workspace Header Bar */}
      <div className="workspace-header-bar">
        <div className="workspace-title-group">
          <span className="workspace-tag">WORKSPACE</span>
          <h2 className="workspace-id">{roomId}</h2>
          <button
            type="button"
            className="btn-copy-id"
            onClick={handleCopyId}
            title="Copy Room ID to clipboard"
          >
            {copied ? '✓ Copied!' : '📋 Copy ID'}
          </button>
        </div>

        {/* Action Buttons: Leave Room & End Room */}
        <div className="workspace-actions">
          <button
            type="button"
            onClick={onLeaveRoom}
            className="btn-leave-room"
            title="Exit this workspace room"
          >
            🚪 Leave Room
          </button>
          <button
            type="button"
            onClick={onEndRoom}
            className="btn-end-room"
            title="End workspace for all participants"
          >
            🛑 End Room
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Blank Editor Canvas + Sidebar (Users & Chat) */}
      <div className="workspace-body-grid">
        {/* Left/Center: Blank Workspace Canvas (Reserved for Monaco Editor & Future Tools) */}
        <div className="workspace-canvas-panel card">
          <div className="canvas-header">
            <div className="canvas-tabs">
              <span className="canvas-tab active">
                <span className="file-icon">📄</span> app.js
              </span>
            </div>
            <span className="canvas-badge">Ready for Editor</span>
          </div>

          <div className="canvas-blank-area">
            <div className="blank-placeholder-content">
              <div className="placeholder-icon">💻</div>
              <h3>Collaborative Editor Area</h3>
              <p>
                This space is reserved for the <strong>Monaco Editor</strong> and real-time code synchronization in the next step.
              </p>
              <div className="placeholder-pill">
                <span>Room: <code>{roomId}</code></span>
                <span>•</span>
                <span>{users.length} {users.length === 1 ? 'user' : 'users'} connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Connected Users + Live Room Chat */}
        <div className="workspace-sidebar">
          {/* Connected Users Panel */}
          <div className="card users-card">
            <div className="panel-header">
              <div className="panel-title">
                <span className="user-icon">👥</span>
                <span>Room Users</span>
                <span className="user-count-pill">{users.length}</span>
              </div>
            </div>

            <div className="users-list">
              {users.map((u) => {
                const isMe = u.socketId === currentUser?.socketId;
                return (
                  <div key={u.socketId} className={`user-row ${isMe ? 'user-me' : ''}`}>
                    <span className="user-status-dot">●</span>
                    <span className="user-name">
                      {u.name} {isMe && <span className="you-pill">You</span>}
                    </span>
                    <span className="user-socket-short" title={`Socket ID: ${u.socketId}`}>
                      #{u.socketId?.slice(-4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-Room ChatBox */}
          <div className="card chatbox-card">
            <ChatBox
              messages={chatMessages}
              currentUser={currentUser}
              onSendMessage={onSendChatMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
