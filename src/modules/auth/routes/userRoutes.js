const express = require("express");
const { loginUser, logoutUser, registerUser, viewUser, followUser, unfollowUser } = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();
// console.log("in user routes");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", isAuthenticated, logoutUser);
router.get("/:id", isAuthenticated , viewUser)
router.post("/:id/follow",isAuthenticated, followUser);
router.post("/:id/unfollow", isAuthenticated, unfollowUser);

module.exports = router;



