const express = require("express");
const founderController = require("../controllers/founderController");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

// router.route("/login").post(loginUser);

router.route("/register").post(founderController.registerfounder);
router.route("/login").post(founderController.loginFounder);
router.route("/logout").post(founderController.logoutFounder);

// router.route("/follow/:id").post(isAuthenticated, founderController.followUser);

module.exports = router;
