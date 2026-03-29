import { connect } from 'amqplib';
import notificationService from '../services/notificationService.js'; 

/**
 * Initializes the RabbitMQ consumer.
 * @param {Object} io - Socket.io server instance to be passed to the service.
 */
async function startConsumer(io) { 
  try {
    // Establish connection to RabbitMQ server
    const connection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'notifications';

    // Ensure the consumer processes only one message at a time (Backpressure control)
    await channel.prefetch(1); 

    // Ensure the queue exists and persists through restarts
    await channel.assertQueue(queue, { durable: true });
    console.log(`Listening for messages in [${queue}] queue...`);

    // Start consuming messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          // Parse the incoming buffer to a JSON object
          const content = msg.content.toString();
          const data = JSON.parse(content);

          console.log("Received task from queue:", data.type);

          // Verify that mandatory fields are present before processing
          if (!data.recipientId || !data.type || !data.content) {
            console.error("[Validation Failed] Missing required fields. Skipping message.");
            return channel.ack(msg); // Remove malformed message from queue to prevent infinite loop
          }
          
          // Delegate the validated data to the business logic service
          await notificationService.handleIncomingNotification(data, io); 
          
          // Inform RabbitMQ that the message was successfully processed
          channel.ack(msg); 
        } catch (error) {
          /**
           * Handle JSON parsing errors or unexpected logic failures.
           * We use nack with requeue: true only for transient errors.
           */
          console.error("Error processing message:", error.message);
          
          // If it's a syntax error in JSON, don't requeue (it will never be valid)
          const isJsonError = error instanceof SyntaxError;
          channel.nack(msg, false, !isJsonError); 
        }
      }
    });

    // Handle unexpected connection drops
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
      setTimeout(() => startConsumer(io), 5000);
    });

  } catch (error) {
    console.error("Consumer connection failed:", error);
    // Retry connection after a delay
    setTimeout(() => startConsumer(io), 5000); 
  }
}

export { startConsumer }; 