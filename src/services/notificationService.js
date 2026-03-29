import Notification from '../models/Notification';
import { io } from '../../app';

/**
 * Service to handle notification logic: Persisting to DB and real-time broadcasting.
 */
const handleIncomingNotification = async (data) => {
    try {
        const { recipientId, type, entityId, content, link, senderId } = data;

        // Upsert Logic: Updates existing unread notification or creates a new one
        const notification = await Notification.findOneAndUpdate(
            { 
                recipientId, 
                type, 
                entityId, 
                isRead: false 
            },
            { 
                // Increment notification counter for stacking (e.g., "X people liked...")
                $inc: { counter: 1 }, 
                $set: { 
                    content, 
                    link, 
                    senderId, 
                    updatedAt: new Date() 
                } 
            },
            { 
                upsert: true, // Create if not found
                new: true     // Return the updated document
            }
        );

        console.log(`Notification processed and saved for user: ${recipientId}`);

        // Emit notification only to the specific user's socket room
        io.to(recipientId).emit('new_notification', notification);

    } catch (error) {
        console.error('Service Error - handleIncomingNotification:', error);
        // Throw error back to consumer for RabbitMQ re-queuing
        throw error; 
    }
};

export default {
    handleIncomingNotification
};