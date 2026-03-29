/**
 * Manages WebSocket connections and room assignments.
 */
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      // Fires when a client establishes a connection
      console.log(`User connected: ${socket.id}`);
  
      /**
       * Subscribes a user to a private room based on their unique ID.
       * This allows targeted broadcasting from the notification service.
       */
      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
      });
  
      // Cleanup when the user closes the application
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  };
  
  export default socketHandler;