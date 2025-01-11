const express = require("express");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.route("/register").post(authController.registerUser);
router.route("/login").post(authController.loginUser);
router.route("/logout").post(authController.logoutUser);

module.exports = router;
