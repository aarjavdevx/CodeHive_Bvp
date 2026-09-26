import { useState } from 'react';

/**
 * Generates a clean random room ID (e.g. "hive-8k2p")
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
 * Supports both creating and joining existing collaborative rooms.
 */
export default function HomeScreen({
  isConnected,
  onCreateRoom,
  onJoinRoom,
  errorMessage,
  onClearError,
  initialUserName = ''
}) {
  const [userName, setUserName] = useState(initialUserName);
  const [createRoomId, setCreateRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [inputError, setInputError] = useState('');

  // Handle Create Room
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setInputError('Please enter your display name.');
      return;
    }
    if (!isConnected) {
      setInputError('Cannot create workspace while disconnected.');
      return;
    }

    setInputError('');
    if (onClearError) onClearError();

    const targetRoomId = createRoomId.trim() || generateRandomRoomId();
    onCreateRoom(targetRoomId, userName.trim());
  };

  // Handle Join Room
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setInputError('Please enter your display name.');
      return;
    }
    if (!joinRoomId.trim()) {
      setInputError('Please enter the Room ID to join.');
      return;
    }
    if (!isConnected) {
      setInputError('Cannot join workspace while disconnected.');
      return;
    }

    setInputError('');
    if (onClearError) onClearError();

    onJoinRoom(joinRoomId.trim(), userName.trim());
  };

  return (
    <div className="home-screen-card">
      <div className="home-header">
        <h2 className="home-title">Collaborative Workspace</h2>
        <p className="home-subtitle">
          Join an existing room or create a new one to code and chat in real time.
        </p>
      </div>

      {/* Global Error Banner */}
      {(inputError || errorMessage) && (
        <div className="error-banner">
          <span>⚠️ {inputError || errorMessage}</span>
        </div>
      )}

      {/* Shared Display Name Input */}
      <div className="form-group mb-20">
        <label htmlFor="shared-user-name">Your Display Name</label>
        <input
          id="shared-user-name"
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

      {/* Tabs: Join Room / Create Room */}
      <div className="home-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'join' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('join');
            setInputError('');
          }}
        >
          🚪 Join Existing Room
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'create' ? 'tab-active' : ''}`}
          onClick={() => {
            setActiveTab('create');
            setInputError('');
          }}
        >
          ✨ Create New Room
        </button>
      </div>

      {/* Tab 1: Join Existing Room */}
      {activeTab === 'join' && (
        <form onSubmit={handleJoinSubmit} className="tab-form">
          <div className="form-group">
            <label htmlFor="join-room-input">Room ID / Code</label>
            <input
              id="join-room-input"
              type="text"
              placeholder="e.g. college-project"
              value={joinRoomId}
              onChange={(e) => {
                setJoinRoomId(e.target.value);
                setInputError('');
              }}
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected}
            className="btn-primary btn-large"
          >
            ➡️ Join Workspace
          </button>
        </form>
      )}

      {/* Tab 2: Create New Room */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="tab-form">
          <div className="form-group">
            <label htmlFor="create-room-input">
              Custom Room ID <span className="optional-text">(optional, auto-generated if blank)</span>
            </label>
            <input
              id="create-room-input"
              type="text"
              placeholder="e.g. project-x (leave empty for random)"
              value={createRoomId}
              onChange={(e) => {
                setCreateRoomId(e.target.value);
                setInputError('');
              }}
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected}
            className="btn-primary btn-large"
          >
            ⚡ Create Workspace
          </button>
        </form>
      )}
    </div>
  );
}
