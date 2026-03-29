import { connect } from 'mongoose';

/**
 * Connects to the MongoDB database instance.
 * Ensures the application does not run without a persistent data store.
 */
const connectDB = async () => {
  try {
    // Attempt to connect using URI from environment variables or local fallback
    const conn = await connect(process.env.MONGO_URI || 'mongodb://localhost:27017/notifications');
    
    // Log success message with the host name for debugging
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Handle connection failures and terminate the process to avoid inconsistent state
    console.error(`Mongo connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;