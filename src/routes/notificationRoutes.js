import express from 'express';
import * as notificationController from '../controllers/notificationController.js'; 

const router = express.Router();

/**
 * @route   GET /api/notifications/unread-count/:userId
 * @desc    Get the count of unread notifications for a specific user
 */
router.get('/unread-count/:userId', notificationController.getUnreadNotificationsCount);

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications for a user
 */
router.get('/:userId', notificationController.getUserNotifications);


/**
 * @route   PATCH /api/notifications/mark-all-read/:userId
 * @desc    Mark all user notifications as read
 */
router.patch('/mark-all-read/:userId', notificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/toggle-read
 * @desc    Toggle notification read/unread status
 * @access  Private (Ensure you have auth middleware)
 */
router.patch('/:id/toggle-read', notificationController.toggleReadStatus);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 */
router.delete('/:id', notificationController.deleteNotification);

export default router;