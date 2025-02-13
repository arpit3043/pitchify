const express = require("express");

const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");
const trendingTopicsRoutes = require("../modules/trendingTopics/routes/trendingTopicsRoutes.js");
const userRoutes = require("../modules/auth/routes/userRoutes");
const founderRoutes = require("../modules/profile/routes/founderRoutes");

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/trending", trendingTopicsRoutes);

router.use("/users", userRoutes);
router.use("/trending", trendingTopicsRoutes);
router.use("/founders", founderRoutes);
router.use("/investors", investorRoutes);
router.use("/posts", postRoutes);


module.exports = router;
