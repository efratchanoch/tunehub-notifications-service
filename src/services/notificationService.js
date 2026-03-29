import Notification from '../models/Notification.js';

/**
 * List of notification types that should be aggregated (stacked) instead of creating new entries.
 */
const STACKABLE_TYPES = [
    'LIKE_POST', 
    'LIKE_COMMENT', 
    'LIKE_SHEET_MUSIC', 
    'FAVORITE_POST', 
    'FAVORITE_SHEET_MUSIC'
];

/**
 * Service to handle notification logic: Persisting to MongoDB and real-time broadcasting via Socket.io.
 * Supports incremental updates (increment/decrement) for stackable notifications.
 * * @param {Object} data - Notification data from RabbitMQ.
 * @param {Object} io - Socket.io instance for real-time emission.
 */
const handleIncomingNotification = async (data, io) => {
    try {
        const { recipientId, type, entityId, content, link, senderId, action } = data;
        let notification;

        if (STACKABLE_TYPES.includes(type)) {
            // Determine the numeric change based on the action provided (default to increment)
            const change = action === 'decrement' ? -1 : 1;

            // Upsert Logic: Update existing unread notification or create a new one
            notification = await Notification.findOneAndUpdate(
                { 
                    recipientId, 
                    type, 
                    entityId, 
                    isRead: false 
                },
                { 
                    $inc: { counter: change }, 
                    $set: { 
                        content, 
                        link, 
                        senderId, 
                        updatedAt: new Date() 
                    } 
                },
                { 
                    upsert: true, 
                    returnDocument: 'after' 
                }
            );

            // If the counter reaches zero or less, delete the notification and inform the client
            if (notification && notification.counter <= 0) {
                await Notification.deleteOne({ _id: notification._id });
                if (io) {
                    io.to(recipientId).emit('delete_notification', notification._id);
                }
                console.log(`Notification [${type}] removed for user: ${recipientId} (Counter reached 0)`);
                return;
            }
        } else {
            // Logic for non-stackable notifications: Always create a new record
            notification = await Notification.create({
                recipientId,
                type,
                entityId,
                content,
                link,
                senderId,
                counter: 1
            });
        }

        console.log(`Notification processed [${type}] for user: ${recipientId} | Action: ${action || 'increment'}`);

        // Emit notification to the specific user's socket room
        if (io && notification) {
            io.to(recipientId).emit('new_notification', notification);
        }

    } catch (error) {
        console.error('Service Error - handleIncomingNotification:', error);
        throw error; 
    }
};

export default {
    handleIncomingNotification
};