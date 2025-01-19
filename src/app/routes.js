const express = require("express");

<<<<<<< HEAD
const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const authRoutes = require("../modules/auth/routes/authRoutes.js");
const userRoutes = require("../modules/user/routes/userRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");
const trendingTopicsRoutes = require("../modules/trendingTopics/routes/trendingTopicsRoutes.js");

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/users", authRoutes, userRoutes);
router.use("/post", postRoutes);
router.use("/trending", trendingTopicsRoutes);
=======
const userRoutes = require("../modules/auth/routes/userRoutes");
const founderRoutes = require("../modules/profile/routes/founderRoutes");
const postRoutes = require("../modules/activityFeed/routes/postRoutes");


const router = express.Router();

// Auth routes (public)
router.use("/auth", userRoutes);

// Protected routes
router.use("/founders", founderRoutes);
router.use("/posts", postRoutes);
>>>>>>> 39519b2f30a5bb00a273ff8b01c8bb76c95cbf7c

module.exports = router;
