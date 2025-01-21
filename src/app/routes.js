const express = require("express");


const userRoutes = require("../modules/auth/routes/userRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");
const trendingTopicsRoutes = require("../modules/trendingTopics/routes/trendingTopicsRoutes.js");
const founderRoutes = require("../modules/profile/routes/founderRoutes");
const investorRoutes = require("../modules/profile/routes/investorRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/trending", trendingTopicsRoutes);
router.use("/founders", founderRoutes);
router.use("/investors", investorRoutes);
router.use("/posts", postRoutes);


module.exports = router;
