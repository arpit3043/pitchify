const express = require("express");
const { loginUser, logoutUser, registerUser } = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();
// console.log("in user routes");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", isAuthenticated, logoutUser);

module.exports = router;



