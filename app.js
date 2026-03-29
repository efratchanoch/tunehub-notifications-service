import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import socketHandler from './src/socket/socketHandler.js';
import { startConsumer } from './src/messaging/notificationConsumer.js';
import dotenv from 'dotenv';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Database Connection
connectDB();

// Middleware
app.use(express.json());

// Socket.io Initialization
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Activate Socket Handler
socketHandler(io);

// Start RabbitMQ Consumer and inject the Socket.io instance
startConsumer(io);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'TuneHub-Notifications' });
});

server.listen(PORT, () => {
  console.log(`Notification Server running on port ${PORT}`);
});

// API Routes
app.use('/api/notifications', notificationRoutes);

export { app, io, server };