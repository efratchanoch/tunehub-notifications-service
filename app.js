import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

// Custom Imports
import connectDB from './src/config/db.js';
import socketHandler from './src/socket/socketHandler.js';
import {startConsumer} from './src/messaging/notificationConsumer.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

/**
 * Database Connection
 */
connectDB();

/**
 * Global Middleware
 */
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON bodies


/**
 * @description Server-side Socket.io initialization with CORS policy.
 */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // The URL of Angular app
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

// Initialize Socket event listeners
socketHandler(io);

/**
 * API Routes
 */
app.use('/api/notifications', notificationRoutes);

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'TuneHub-Notifications',
    timestamp: new Date()
  });
});

/**
 * Background Services
 * Start RabbitMQ Consumer and inject the Socket.io instance for real-time delivery
 */
startConsumer(io);

/**
 * Server Activation
 */
server.listen(PORT, () => {
  console.log(`[Notification-Service] Running on port ${PORT}`);
});

// Export instances for testing or external use
export { app, io, server };