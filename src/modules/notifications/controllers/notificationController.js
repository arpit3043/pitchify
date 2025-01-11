/**
 * @fileoverview Controller handling HTTP requests for notification endpoints
 * Implements request validation and response formatting
 */

const NotificationService = require('../services/notificationService');
const { validateNotification } = require('../../../utils/validations');

class NotificationController {
    /**
     * Creates a new notification
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createNotification(req, res) {
        try {
            // Validate incoming notification data
            const validatedData = await validateNotification(req.body);
            const notification = await NotificationService.createNotification(validatedData);
            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Retrieves paginated notifications for authenticated user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserNotifications(req, res) {
        try {
            const { page, limit } = req.query;
            const notifications = await NotificationService.getUserNotifications(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            );
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Marks a notification as read
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async markAsRead(req, res) {
        try {
            const notification = await NotificationService.markAsRead(
                req.params.id,
                req.user._id
            );
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json(notification);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new NotificationController();
