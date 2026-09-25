import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Express REST routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Health-check endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeHive Socket.IO server is running' });
});

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
// Socket.IO requires its own CORS configuration so the React dev server (e.g. localhost:5173)
// can open WebSocket/polling connections without browser security errors.
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend client connections
    methods: ['GET', 'POST']
  }
});

// Basic connection listener
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  CodeHive Server running at http://localhost:${PORT}`);
  console.log(`  Socket.IO initialized and ready for clients`);
  console.log(`===============================================`);
});
