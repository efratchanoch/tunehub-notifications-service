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
 * @route   PATCH /api/notifications/:id/read
 * @description Updates isRead status to true for a single notification.
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
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