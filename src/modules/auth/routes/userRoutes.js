const express = require("express");
const RateLimit = require("express-rate-limit");
const {
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
  userData, sendConnectionRequest, acceptConnectionRequest, getPendingRequestsForAUser, rejectConnectionRequest,
  removeConnection,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

// Public routes
router.get("/", userData);
router.post("/register", limiter, registerUser);
router.post("/login", limiter, loginUser);
router.get("/google", limiter, googleOAuthLogin);
router.get("/google/callback", limiter, googleOAuthCallback);
router.post('/connection-request', isAuthenticated, sendConnectionRequest);
router.post("/connection-request/accept", isAuthenticated, acceptConnectionRequest);
router.post("/connection-request/reject", isAuthenticated, rejectConnectionRequest);
router.get("/connection-requests/:userId", isAuthenticated, getPendingRequestsForAUser);
router.delete("/connection", isAuthenticated, removeConnection);

// Protected routes
router.get("/logout", limiter, isAuthenticated, logoutUser);

module.exports = router;
