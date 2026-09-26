import { useState, useRef, useEffect } from 'react';

/**
 * ChatBox Component
 * In-room real-time chat for collaborators in the same workspace.
 */
export default function ChatBox({ messages = [], currentUser, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <div className="chatbox-title">
          <span className="chat-icon">💬</span>
          <span>Room Chat</span>
          <span className="chat-badge">Live</span>
        </div>
        <span className="chat-privacy-hint" title="Only participants inside this room can see these messages">
          🔒 Room-Only
        </span>
      </div>

      {/* Messages List */}
      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div className="chatbox-empty">
            <p>💬 No messages yet</p>
            <span className="empty-subtext">Send a message to chat with users in this workspace.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.socketId === currentUser?.socketId;
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isMe ? 'message-mine' : 'message-theirs'}`}
              >
                {!isMe && (
                  <span className="chat-sender-name">
                    {msg.sender?.name || 'Anonymous'}
                  </span>
                )}
                <div className="chat-bubble">
                  <p className="chat-text">{msg.text}</p>
                  <span className="chat-time">{timeStr}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      <form onSubmit={handleSend} className="chatbox-input-row">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-chat-send"
          title="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
