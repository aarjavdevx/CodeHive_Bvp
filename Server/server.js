import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { registerRoomHandlers } from './socket/roomHandlers.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Enable CORS for REST routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Server health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CodeHive Socket.IO & Auth server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

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
  console.log(`  Auth endpoints mounted at http://localhost:${PORT}/api/auth`);
  console.log(`  Socket.IO initialized and ready for clients`);
  console.log(`===============================================`);
});
