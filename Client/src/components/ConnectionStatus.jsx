import React from 'react';

/**
 * ConnectionStatus component
 * Displays live Socket.IO connection state, socket ID, and manual connect/disconnect controls.
 */
export default function ConnectionStatus({ isConnected, socketId, onToggleConnect }) {
  return (
    <div className="connection-status-bar">
      <div className="status-indicator-group">
        <span
          className={`status-dot ${isConnected ? 'status-connected' : 'status-disconnected'}`}
        />
        <div className="status-labels">
          <span className="status-text">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isConnected && socketId && (
            <span className="socket-id-badge" title="Unique socket connection ID assigned by server">
              Socket ID: <code>{socketId}</code>
            </span>
          )}
        </div>
      </div>

      <div className="connection-actions">
        <button
          type="button"
          onClick={onToggleConnect}
          className={`btn-connection-toggle ${isConnected ? 'btn-disconnect' : 'btn-connect'}`}
        >
          {isConnected ? 'Simulate Disconnect' : 'Reconnect'}
        </button>
      </div>
    </div>
  );
}
