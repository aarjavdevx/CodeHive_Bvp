import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-badge">⚡</div>
          <div>
            <h1 className="logo-title">CodeHive</h1>
            <p className="logo-subtitle">Real-Time Collaborative Workspace</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="card step-card">
          <h2>Step 1: Architecture Initialized 🚀</h2>
          <p className="description">
            The full-stack foundation has been created:
          </p>
          <ul className="checklist">
            <li>✅ <strong>Backend:</strong> Express &amp; Socket.IO server running on port 5000</li>
            <li>✅ <strong>Frontend:</strong> React + Vite client ready with <code>socket.io-client</code> &amp; Monaco Editor installed</li>
            <li>✅ <strong>Project Structure:</strong> Organized into <code>server/</code> and <code>client/</code> directories</li>
          </ul>
          <div className="info-box">
            Ready for <strong>Step 2</strong>: Establishing the live Socket.IO connection and rendering real-time connection status!
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
