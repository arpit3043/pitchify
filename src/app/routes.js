const express = require("express");

const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");
const trendingTopicsRoutes = require("../modules/trendingTopics/routes/trendingTopicsRoutes.js");
const userRoutes = require("../modules/auth/routes/userRoutes");
const founderRoutes = require("../modules/profile/routes/founderRoutes");

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/trending", trendingTopicsRoutes);

// Auth routes (public)
router.use("/auth", userRoutes);

// Protected routes
router.use("/founders", founderRoutes);
router.use("/posts", postRoutes);


module.exports = router;
