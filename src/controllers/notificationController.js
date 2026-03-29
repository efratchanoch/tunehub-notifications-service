import Notification from '../models/Notification.js';

/**
 * Retrieves a paginated list of notifications with skip/limit.
 * @route GET /api/notifications/:userId?page=1&limit=20
 */
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Pagination logic: Get page from query params, default to 1
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Optional: Count total notifications to tell Frontend if there's more
        const total = await Notification.countDocuments({ recipientId: userId });

        return res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + notifications.length < total,
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Updates a single notification's status to 'isRead: true'.
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true } // Returns the updated document
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error('Error in markAsRead:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error: Update failed' });
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