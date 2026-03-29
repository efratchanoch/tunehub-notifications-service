import { connect } from 'amqplib';
import { handleIncomingNotification } from '../services/notificationService'; 

/**
 * Initializes the RabbitMQ consumer to listen for incoming notification tasks.
 */
async function startConsumer() {
  try {
    // Establish connection to RabbitMQ server
    const connection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'notifications';

    // Ensure the consumer processes only one message at a time
    await channel.prefetch(1); 

    // Ensure the queue exists and persists through restarts
    await channel.assertQueue(queue, { durable: true });
    console.log(`🎧 Listening for messages in [${queue}] queue...`);

    // Start consuming messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log("Received task from queue:", data);
          
          // Delegate the data to the business logic service
          await handleIncomingNotification(data);
          
          // Inform RabbitMQ that the message was successfully processed
          channel.ack(msg); 
        } catch (error) {
          console.error("Error processing message:", error);
          // Re-queue the message to try again later if processing fails
          channel.nack(msg, false, true); 
        }
      }
    });

    // Handle unexpected connection drops
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
      setTimeout(startConsumer, 5000); // Attempt reconnection
    });

  } catch (error) {
    console.error("Consumer connection failed:", error);
    // Exponential backoff or simple delay before retry
    setTimeout(startConsumer, 5000); 
  }
}

startConsumer();