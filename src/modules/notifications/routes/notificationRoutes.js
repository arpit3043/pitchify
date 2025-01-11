/**
 * @fileoverview Express router configuration for notification endpoints
 * Defines API routes and their corresponding controllers
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../../../middlewares/auth');

// Protect all notification routes with authentication
router.use(authMiddleware);

// Route definitions
router.post('/', NotificationController.createNotification);
router.get('/', NotificationController.getUserNotifications);
router.put('/:id/read', NotificationController.markAsRead);

module.exports = router;

// src/utils/redis.js
/**
 * @fileoverview Redis client singleton implementation
 * Manages Redis connection and provides instance access
 */

const Redis = require('ioredis');

class RedisClient {
    constructor() {
        if (!RedisClient.instance) {
            // Initialize Redis connection with environment variables
            this.client = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD
            });
            RedisClient.instance = this;
        }
        return RedisClient.instance;
    }

    /**
     * Returns the Redis client instance
     * @returns {Redis} Redis client instance
     */
    getInstance() {
        return this.client;
    }
}

module.exports = new RedisClient();
