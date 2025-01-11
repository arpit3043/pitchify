/**
 * @fileoverview WebSocket service implementation
 * Manages real-time connections and message distribution
 */

const WebSocket = require('ws');

class WebSocketService {
    constructor() {
        if (!WebSocketService.instance) {
            // Store active connections in a Map for O(1) access
            this.connections = new Map();
            WebSocketService.instance = this;
        }
        return WebSocketService.instance;
    }

    /**
     * Initializes WebSocket server
     * @param {Object} server - HTTP/HTTPS server instance
     */
    initialize(server) {
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws, req) => {
            const userId = this.getUserIdFromRequest(req);
            if (userId) {
                // Store connection mapped to user ID
                this.connections.set(userId, ws);

                // Clean up on connection close
                ws.on('close', () => {
                    this.connections.delete(userId);
                });
            }
        });
    }

    /**
     * Extracts user ID from WebSocket request
     * @param {Object} req - WebSocket request object
     * @returns {string|null} User ID if authenticated
     */
    getUserIdFromRequest(req) {
        // Implement token verification logic here
        return req.userId;
    }

    /**
     * Sends a message to a specific user
     * @param {string} userId - Target user ID
     * @param {Object} data - Message data to send
     */
    sendToUser(userId, data) {
        const userWs = this.connections.get(userId);
        if (userWs && userWs.readyState === WebSocket.OPEN) {
            userWs.send(JSON.stringify(data));
        }
    }

    /**
     * Returns singleton instance
     * @returns {WebSocketService} WebSocket service instance
     */
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
}

module.exports = WebSocketService;
