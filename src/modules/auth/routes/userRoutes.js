const express = require("express");
const RateLimit = require("express-rate-limit");
const {
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
  userData,
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

// Protected routes
router.get("/logout", limiter, isAuthenticated, logoutUser);

module.exports = router;
