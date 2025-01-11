/**
 * @fileoverview Notification Schema definition and model configuration
 * Defines the structure for notification documents in MongoDB with optimized indexes
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Type of notification (e.g., message, profileView, milestoneUpdate)
    // FCM integration

    type: {
        type: String,
        required: true,
        enum: ['message', 'profileView', 'milestoneUpdate']
    },
    // User who triggered the notification (sender)
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // User who will receive the notification
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to related entity (post, message, etc.)
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel',
        required: true
    },
    // Discriminator field for relatedEntityId (determines which model to reference)
    onModel: {
        type: String,
        required: true,
        enum: ['Post', 'Message', 'Profile']
    },
    // Read status of the notification
    isRead: {
        type: Boolean,
        default: false
    },
    // Notification message content
    message: {
        type: String,
        required: true
    },
    // Timestamp for notification creation (indexed for sorting)
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Optimize for time-based queries
    }
}, {
    timestamps: true
});

// Compound index for efficient querying of user notifications
// Allows fast retrieval of notifications for a specific user sorted by date
notificationSchema.index({ targetUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
