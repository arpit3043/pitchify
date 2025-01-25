const express = require("express");
const {
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google", googleOAuthLogin);
router.get("/google/callback", googleOAuthCallback);

// Protected routes
router.get("/logout", isAuthenticated, logoutUser);

module.exports = router;



