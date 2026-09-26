import React from 'react';

/**
 * EventLog component
 * Displays timestamped real-time Socket.IO event history for debugging.
 */
export default function EventLog({ logs = [], onClear }) {
  return (
    <div className="event-log-container">
      <div className="event-log-header">
        <div className="event-log-title">
          <span className="log-icon">📜</span>
          <span>Socket.IO Event Log</span>
          <span className="log-count">({logs.length})</span>
        </div>
        {logs.length > 0 && (
          <button type="button" onClick={onClear} className="btn-clear-log">
            Clear
          </button>
        )}
      </div>

      <div className="event-log-list">
        {logs.length === 0 ? (
          <div className="event-log-empty">No socket events captured yet.</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className={`event-log-item log-type-${log.type || 'info'}`}>
              <span className="log-timestamp">{log.time}</span>
              <span className="log-badge">{log.event}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
