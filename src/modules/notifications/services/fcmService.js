const admin = require('firebase-admin');
const path = require('path');

class FCMService {
    constructor() {
        // Initialize Firebase Admin SDK
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(path.join(__dirname, '../../../../firebase-service-account.json'))
            });
        }
    }

    async sendPushNotification({ userId, title, body }) {
        try {
            // Get user's FCM token from your database
            const user = await User.findById(userId);
            if (!user?.fcmToken) return;

            await admin.messaging().send({
                token: user.fcmToken,
                notification: {
                    title,
                    body,
                },
                android: {
                    priority: 'high',
                },
            });
        } catch (error) {
            console.error('FCM Error:', error);
        }
    }
}

module.exports = new FCMService();
