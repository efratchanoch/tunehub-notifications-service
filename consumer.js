const amqp = require('amqplib');

async function startConsumer() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
    const channel = await conn.createChannel();

    await channel.assertQueue('notifications');

    console.log("🎧 Listening for messages...");

    channel.consume('notifications', (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log("📩 Received:", data);
        
        // TODO: Store notification in MongoDB
        // TODO: Emit to connected Socket.io clients
        
        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error processing message:", error);
        channel.nack(msg, false, true); // Requeue on error
      }
    });
  } catch (error) {
    console.error("❌ Consumer connection failed:", error);
    setTimeout(startConsumer, 5000); // Retry after 5 seconds
  }
}

startConsumer();