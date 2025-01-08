const express = require("express");

const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const authRoutes = require("../modules/auth/routes/authRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/users", authRoutes);
router.use("/post", postRoutes);

module.exports = router;
