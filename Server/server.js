import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerRoomHandlers } from './socket/roomHandlers.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for REST routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Server health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CodeHive Socket.IO server is running',
    timestamp: new Date().toISOString()
  });
});

// Create native HTTP server wrapping Express
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow React client connection from any origin
    methods: ['GET', 'POST']
  }
});

// Connection listener: fires whenever a browser client connects
io.on('connection', (socket) => {
  registerRoomHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  CodeHive Server running at http://localhost:${PORT}`);
  console.log(`  Socket.IO initialized and ready for clients`);
  console.log(`===============================================`);
});
