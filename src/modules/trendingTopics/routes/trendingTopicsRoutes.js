const express = require("express");
const trendingTopicsController = require("../controllers/trendingTopicsController.js");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, trendingTopicsController.trending);

module.exports = router;
