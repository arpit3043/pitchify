const express = require("express");

const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const investorRoutes = require("../modules/profile/routes/investorRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");


const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/investor", investorRoutes);
router.use("/post", postRoutes);


module.exports = router;
