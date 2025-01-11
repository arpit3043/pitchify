/**
 * @fileoverview Notification Service handling all notification-related business logic
 * Manages notification creation, delivery, and storage across different channels
 */

const NotificationModel = require('../models/notificationModel');
const RedisClient = require('../../../utils/redis');
const FCMService = require('./fcmService');
const EmailService = require('./emailService');
const WebSocketService = require('./websocketService');

class NotificationService {
    constructor() {
        // Initialize service dependencies using singleton pattern
        this.redisClient = RedisClient.getInstance();
        this.fcmService = new FCMService();
        this.emailService = new EmailService();
        this.wsService = WebSocketService.getInstance();
    }

    /**
     * Creates a new notification and distributes it across all channels
     * @param {Object} notificationData - Data for the new notification
     * @returns {Promise<Object>} Created notification object
     */
    async createNotification(notificationData) {
        // Create and save notification in MongoDB
        const notification = new NotificationModel(notificationData);
        await notification.save();

        // Cache in Redis for active users
        const redisKey = `notifications:${notificationData.targetUserId}`;
        await this.redisClient.lpush(redisKey, JSON.stringify(notification));
        // Maintain a rolling window of recent notifications (last 100)
        await this.redisClient.ltrim(redisKey, 0, 99);

        // Trigger real-time notification delivery
        await this.sendRealTimeNotifications(notification);

        return notification;
    }

    /**
     * Handles distribution of notifications across different channels
     * @param {Object} notification - Notification object to be sent
     */
    async sendRealTimeNotifications(notification) {
        // Send real-time update via WebSocket
        this.wsService.sendToUser(notification.targetUserId, {
            type: 'NEW_NOTIFICATION',
            payload: notification
        });

        // Send mobile push notification
        await this.fcmService.sendPushNotification({
            userId: notification.targetUserId,
            title: 'New Notification',
            body: notification.message
        });

        // Send email for high-priority notifications
        if (['milestoneUpdate'].includes(notification.type)) {
            await this.emailService.sendNotificationEmail({
                userId: notification.targetUserId,
                subject: 'Important Update',
                content: notification.message
            });
        }
    }

    /**
     * Retrieves paginated notifications for a user
     * Implements caching strategy using Redis for active users
     * @param {string} userId - User ID to fetch notifications for
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of items per page
     * @returns {Promise<Array>} List of notifications
     */
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // Try fetching from Redis cache first
        const redisKey = `notifications:${userId}`;
        const cachedNotifications = await this.redisClient.lrange(redisKey, skip, skip + limit - 1);

        // Return cached data if available
        if (cachedNotifications.length === limit) {
            return cachedNotifications.map(n => JSON.parse(n));
        }

        // Fallback to MongoDB if cache miss
        return NotificationModel.find({ targetUserId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('actorId', 'name avatar')
            .lean();
    }

    /**
     * Marks a notification as read and updates cache
     * @param {string} notificationId - ID of notification to mark as read
     * @param {string} userId - User ID who owns the notification
     * @returns {Promise<Object>} Updated notification object
     */
    async markAsRead(notificationId, userId) {
        // Update in MongoDB
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, targetUserId: userId },
            { isRead: true },
            { new: true }
        );

        if (notification) {
            // Sync Redis cache if notification exists
            const redisKey = `notifications:${userId}`;
            const notifications = await this.redisClient.lrange(redisKey, 0, -1);

            // Update cached notification status
            const updatedNotifications = notifications.map(n => {
                const parsed = JSON.parse(n);
                if (parsed._id === notificationId) {
                    parsed.isRead = true;
                }
                return JSON.stringify(parsed);
            });

            // Replace cache with updated data
            await this.redisClient.del(redisKey);
            if (updatedNotifications.length > 0) {
                await this.redisClient.rpush(redisKey, ...updatedNotifications);
            }
        }

        return notification;
    }
}

module.exports = new NotificationService();
