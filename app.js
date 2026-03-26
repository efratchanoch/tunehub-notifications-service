const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('./consumer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDBction
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/notifications')
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.log("❌ Mongo connection failed:", err));

// HTTP Server with Socket.io
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = { app, io, server };
  

  
