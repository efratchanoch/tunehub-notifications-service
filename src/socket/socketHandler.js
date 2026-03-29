/**
 * Socket.io handler to manage client connections and session mapping.
 * Implements mapping socket sessions to user IDs using Rooms.
 */
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      // Join a room named after the userId to enable targeted broadcasting
      socket.join(userId);
      console.log(`User [${userId}] connected with socket [${socket.id}]`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket [${socket.id}] disconnected`);
    });

    // Optional: Error handling for socket communication
    socket.on('error', (err) => {
      console.error(`Socket error for [${socket.id}]:`, err.message);
    });
  });
};

export default socketHandler;