import { useState } from 'react';

/**
 * Generates a clean, readable random room ID (e.g. "hive-x7k2")
 */
function generateRandomRoomId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `hive-${random}`;
}

/**
 * HomeScreen Component
 * Allows entering display name and creating or joining a workspace room.
 */
export default function HomeScreen({
  isConnected,
  onCreateRoom,
  errorMessage,
  onClearError
}) {
  const [userName, setUserName] = useState('');
  const [customRoomId, setCustomRoomId] = useState('');
  const [inputError, setInputError] = useState('');

  // Handle Create Room
  const handleCreate = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setInputError('Please enter your display name.');
      return;
    }
    if (!isConnected) {
      setInputError('Cannot create room while disconnected from server.');
      return;
    }

    setInputError('');
    if (onClearError) onClearError();

    // Use custom room ID if provided, otherwise generate a unique code
    const targetRoomId = customRoomId.trim() || generateRandomRoomId();
    onCreateRoom(targetRoomId, userName.trim());
  };

  return (
    <div className="home-screen-card">
      <div className="card-header-badge">Step 3 of 8</div>
      <h2 className="home-title">Collaborative Workspace</h2>
      <p className="home-subtitle">
        Create an isolated real-time room to collaborate with your team.
      </p>

      {/* Error Banner */}
      {(inputError || errorMessage) && (
        <div className="error-banner">
          <span>⚠️ {inputError || errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="home-form">
        {/* Name input */}
        <div className="form-group">
          <label htmlFor="user-name-input">Your Display Name</label>
          <input
            id="user-name-input"
            type="text"
            placeholder="e.g. Sahil"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setInputError('');
            }}
            maxLength={25}
            autoFocus
          />
        </div>

        {/* Optional Custom Room ID */}
        <div className="form-group">
          <label htmlFor="room-id-input">
            Room ID <span className="optional-text">(leave blank for auto-generated)</span>
          </label>
          <input
            id="room-id-input"
            type="text"
            placeholder="e.g. college-project"
            value={customRoomId}
            onChange={(e) => {
              setCustomRoomId(e.target.value);
              setInputError('');
            }}
            maxLength={30}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={!isConnected}
            className="btn-primary btn-large"
          >
            ⚡ Create Room
          </button>
        </div>

        <div className="home-divider">
          <span>OR</span>
        </div>

        <div className="join-teaser">
          <p>Already have a Room ID to join?</p>
          <div className="join-inputs-row">
            <input
              type="text"
              placeholder="Enter Room ID"
              disabled
              title="Joining existing rooms will be enabled in Step 4"
            />
            <button
              type="button"
              disabled
              className="btn-secondary"
              title="Coming in Step 4"
            >
              Join Room (Step 4)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
