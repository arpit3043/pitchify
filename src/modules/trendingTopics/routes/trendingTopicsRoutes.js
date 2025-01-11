const express = require("express");
const trendingTopics = require("../controllers/trendingTopicsController");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

router.route("/").post(isAuthenticated, trendingTopics.trending);

module.exports = router;
