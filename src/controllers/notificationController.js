import Notification from '../models/Notification.js';


/**
 * @route   GET /api/notifications/:userId
 * @description Retrieves a paginated list of notifications.
 * @access  Public (Should be protected by Auth middleware in production)
 */
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ensure userId is treated consistently. 
        // If your DB stores IDs as Strings, ensure the query uses a String.
        const targetUserId = String(userId);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Fetching notifications with descending sort (newest first)
        const notifications = await Notification.find({ recipientId: targetUserId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipientId: targetUserId });

        /**
         * IMPORTANT: Frontend expects 'res.data' to be an array.
         * The structure below matches the Angular 'fetchData' logic.
         */
        return res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + notifications.length < total,
            data: notifications // Ensure this is exactly what the frontend maps
        });
    } catch (error) {
        console.error(`[Error] Fetching notifications for ${req.params.userId}:`, error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * Marks all unread notifications as read for a specific user.
 */
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error in markAllAsRead:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/notifications/unread-count/:userId
 * @description Retrieves the total number of unread notifications for a specific user.
 * @access  Public
 */
export const getUnreadNotificationsCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const unreadCount = await Notification.countDocuments({ 
            recipientId: String(userId), 
            isRead: false 
        });

        return res.status(200).json({ 
            success: true, 
            unreadCount 
        });
    } catch (error) {
        console.error(`[Error] Fetching unread count for ${req.params.userId}:`, error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error' 
        });
    }
};

/**
 * @route PATCH /api/notifications/:id/toggle-read
 * @description Toggles the 'isRead' status using MongoDB _id
 */
export const toggleReadStatus = async (req, res) => {
    try {
        const { id } = req.params; 

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = !notification.isRead;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


/**
 * Deletes a notification from the database and notifies the client via Socket.io.
 * * This method handles two scenarios:
 * 1. Internal/Automatic Deletion: Triggered when the notification counter reaches zero.
 * 2. Manual Deletion: Triggered by a standard DELETE request using the notification ID.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a 200 OK status on success or 500 on server error.
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        /**
         * Scenario 1: Logic for auto-deletion based on counter.
         * Note: Ensure 'notification' and 'recipientId' are defined in the scope 
         * if this is called internally.
         */
        if (typeof notification !== 'undefined' && notification.counter <= 0) {
            const deletedId = notification._id;
            await Notification.deleteOne({ _id: deletedId });
            
            if (notification.counter <= 0) {
                const deletedId = notification._id.toString(); 
                const recipientId = notification.recipientId.toString();
            
                await Notification.deleteOne({ _id: notification._id });
            
                if (global.io) {
                    console.log(`Emitting delete to user_${recipientId} for ID: ${deletedId}`);
                    global.io.to(`user_${recipientId}`).emit('delete_notification', deletedId);
                }
            }
            return;
        }

        /**
         * Scenario 2: Standard manual deletion via API.
         */
        const result = await Notification.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Notification successfully deleted' 
        });

    } catch (error) {
        console.error(`[Delete Error] ID ${req.params.id}:`, error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error' 
        });
    }
};