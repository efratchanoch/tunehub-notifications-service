import Notification from '../models/Notification.js';

/**
 * List of notification types that should be aggregated (stacked) instead of creating new entries.
 */
const STACKABLE_TYPES = [
    'LIKE_POST', 
    'LIKE_COMMENT', 
    'LIKE_SHEET_MUSIC', 
    'FAVORITE_POST', 
    'FAVORITE_SHEET_MUSIC',
    'FOLLOW_REQUEST_RECEIVED',
    'FOLLOW_REQUEST_STATUS_UPDATE'
];

/**
 * Service to handle notification logic: Persisting to MongoDB and real-time broadcasting via Socket.io.
 * Supports incremental updates (increment/decrement) for stackable notifications.
 * * @param {Object} data - Notification data from RabbitMQ.
 * @param {Object} io - Socket.io instance for real-time emission.
 */
const handleIncomingNotification = async (data, io) => {
    try {
        const { recipientId, type, targetType, entityId, content, senderId, currentCount } = data;

        const query = { recipientId, entityId, type };

        const update = { 
            $set: { 
                content, 
                senderId, 
                targetType, 
                counter: currentCount, 
                isRead: false, 
                createdAt: new Date()
            }
        };

        const notification = await Notification.findOneAndUpdate(query, update, { 
            upsert: true, 
            new: true 
        });

        if (io && notification) {
            io.to(`user_${recipientId}`).emit('new_notification', notification);

            const unreadCount = await Notification.countDocuments({ 
                recipientId, 
                isRead: false 
            });
            io.to(`user_${recipientId}`).emit('unread_count_update', unreadCount);
        }
    } catch (error) {
        console.error('Notification Service Error:', error);
    }
};

export default {
    handleIncomingNotification
};