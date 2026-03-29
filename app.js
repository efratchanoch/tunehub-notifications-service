import express, { json } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db';
import socketHandler from './src/socket/socketHandler';
require('dotenv').config();

// Initialize Express application
const app = express();

// Create HTTP server to support both Express and Socket.io
const server = createServer(app);
const PORT = process.env.PORT || 3000;

/**
 * Initialize core infrastructure components
 */
connectDB(); // Establishes MongoDB connection

// Global Middleware
app.use(json()); // Parses incoming JSON payloads

/**
 * WebSocket Server Configuration
 * Allows cross-origin requests for frontend integration
 */
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  }
});

// Attach Socket events handling logic
socketHandler(io);

/**
 * Messaging Infrastructure
 * Starts the RabbitMQ consumer to process background tasks
 */
import './src/messaging/notificationConsumer';

/**
 * Health Check Route
 * Used for service monitoring and availability verification
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'TuneHub-Notifications' });
});

/**
 * Start the Server
 */
server.listen(PORT, () => {
  console.log(`🚀 Notification Server running on port ${PORT}`);
});

// Export objects for potential testing or shared use
export default { app, io };