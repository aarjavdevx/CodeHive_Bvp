import EventLog from '../components/EventLog.jsx';

/**
 * RoomScreen Component
 * Rendered when the user is inside an active workspace room.
 */
export default function RoomScreen({
  roomId,
  currentUser,
  users = [],
  isConnected,
  onLeaveRoom,
  logs = [],
  onClearLogs
}) {
  return (
    <div className="room-screen-layout">
      {/* Workspace Bar */}
      <div className="workspace-header-bar">
        <div className="workspace-title-group">
          <span className="workspace-tag">WORKSPACE</span>
          <h2 className="workspace-id">{roomId}</h2>
          <button
            type="button"
            className="btn-copy-id"
            onClick={() => navigator.clipboard.writeText(roomId)}
            title="Copy Room ID to clipboard"
          >
            📋 Copy ID
          </button>
        </div>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="btn-leave-room"
          title="Exit this workspace room"
        >
          ✕ Leave Workspace
        </button>
      </div>

      {/* Main Grid: Connected Users + Room Details + Event Log */}
      <div className="room-content-grid">
        {/* Connected Users Panel */}
        <div className="card users-card">
          <div className="panel-header">
            <div className="panel-title">
              <span className="user-icon">👥</span>
              <span>Connected Users</span>
              <span className="user-count-pill">{users.length}</span>
            </div>
          </div>

          <div className="users-list">
            {users.length === 0 ? (
              <div className="no-users-notice">No users currently in room.</div>
            ) : (
              users.map((u) => {
                const isMe = u.socketId === currentUser?.socketId;
                return (
                  <div key={u.socketId} className={`user-row ${isMe ? 'user-me' : ''}`}>
                    <span className="user-status-dot">●</span>
                    <span className="user-name">
                      {u.name} {isMe && <span className="you-pill">You</span>}
                    </span>
                    <span className="user-socket-short" title={`Socket ID: ${u.socketId}`}>
                      #{u.socketId.slice(-4)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="room-footer-status">
            <span className="footer-label">Transport Link:</span>
            <span className={`footer-value ${isConnected ? 'status-online' : 'status-offline'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </div>

        {/* Real-time Socket Event Log Panel */}
        <div className="card log-card">
          <EventLog logs={logs} onClear={onClearLogs} />
        </div>
      </div>
    </div>
  );
}
