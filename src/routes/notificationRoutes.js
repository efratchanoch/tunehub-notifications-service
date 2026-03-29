import express from 'express';
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead 
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications for a user
 */
router.get('/:userId', getUserNotifications);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 */
router.patch('/:id/read', markAsRead);

/**
 * @route   PATCH /api/notifications/mark-all-read/:userId
 * @desc    Mark all user notifications as read
 */
router.patch('/mark-all-read/:userId', markAllAsRead);

export default router;