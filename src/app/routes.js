const express = require("express");

const userRoutes = require("../modules/auth/routes/userRoutes");
const founderRoutes = require("../modules/profile/routes/founderRoutes");
const postRoutes=require("../modules/activityFeed/routes/postRoutes.js")
const investorRoutes = require("../modules/profile/routes/investorRoutes");


const router = express.Router();

// Auth routes (public)
router.use("/auth", userRoutes);

// Protected routes
router.use("/founders", founderRoutes);
router.use("/investors", investorRoutes);
router.use("/posts", postRoutes);

module.exports = router;
